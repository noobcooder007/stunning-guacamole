import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { QuantityDifferenceReportResponseDto } from '@/donation/application/dto/quantity-difference-report.response.dto';

const MONTH_LABELS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

function fmt(amount: number | null): string {
  if (amount === null) return 'N/D';
  return `$${Number(amount).toFixed(2)}`;
}

const divider = (width: number): Content => ({
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: width,
      y2: 0,
      lineWidth: 0.5,
      lineColor: '#cccccc',
    },
  ],
  margin: [0, 0, 0, 6],
});

export const quantityDifferenceReportTemplate = (
  data: QuantityDifferenceReportResponseDto,
  generatedAt: string,
): TDocumentDefinitions => {
  const periodLabel = `${MONTH_LABELS[data.month - 1]} ${data.year}`;

  // Se muestra el total consolidado en MXN (moneda base). Si el período está
  // abierto y tiene recibos en USD, aún no hay tipo de cambio y se muestra "N/D".
  const collectorRows: Content[][] = data.collectors.map((c) => [
    { text: String(c.collectorNumber), fontSize: 9, alignment: 'center' },
    { text: c.collectorName, fontSize: 9 },
    {
      text: fmt(c.assignedAmountConsolidatedMxn),
      fontSize: 9,
      alignment: 'right',
    },
    {
      text: fmt(c.collectedAmountConsolidatedMxn),
      fontSize: 9,
      alignment: 'right',
      color: '#2e7d32',
    },
    {
      text: fmt(c.differenceConsolidatedMxn),
      fontSize: 9,
      alignment: 'right',
      color:
        c.differenceConsolidatedMxn !== null && c.differenceConsolidatedMxn > 0
          ? '#e65100'
          : '#555555',
    },
  ]);

  const totalsRow: Content[] = [
    {
      text: 'TOTAL',
      bold: true,
      fontSize: 9,
      colSpan: 2,
      alignment: 'right',
    } as any,
    {} as any,
    {
      text: fmt(data.totals.assignedAmountConsolidatedMxn),
      bold: true,
      fontSize: 9,
      alignment: 'right',
    },
    {
      text: fmt(data.totals.collectedAmountConsolidatedMxn),
      bold: true,
      fontSize: 9,
      alignment: 'right',
      color: '#2e7d32',
    },
    {
      text: fmt(data.totals.differenceConsolidatedMxn),
      bold: true,
      fontSize: 9,
      alignment: 'right',
      color: '#e65100',
    },
  ];

  return {
    content: [
      {
        text: 'REPORTE DE DIFERENCIA DE CANTIDADES',
        bold: true,
        fontSize: 11,
        alignment: 'center',
        color: '#333333',
        margin: [0, 0, 0, 4],
      },
      divider(515),
      {
        columns: [
          {
            stack: [
              { text: 'PERÍODO', fontSize: 8, color: '#888888' },
              {
                text: periodLabel,
                bold: true,
                fontSize: 13,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'ESTADO',
                fontSize: 8,
                color: '#888888',
                alignment: 'right',
              },
              {
                text:
                  data.periodStatus === 'OPEN'
                    ? 'ABIERTO'
                    : data.periodStatus === 'CLOSED'
                      ? 'CERRADO'
                      : 'SIN PERIODO',
                bold: true,
                fontSize: 13,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'GENERADO',
                fontSize: 8,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: generatedAt,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      divider(515),
      {
        layout: 'letterTable',
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              {
                text: 'NO.',
                bold: true,
                fontSize: 8,
                alignment: 'center',
                color: '#555555',
              },
              { text: 'COLECTOR', bold: true, fontSize: 8, color: '#555555' },
              {
                text: 'ASIGNADO (MXN)',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'COBRADO (MXN)',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'DIFERENCIA (MXN)',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
            ],
            ...collectorRows,
            totalsRow,
          ],
        },
        margin: [0, 0, 0, 4],
      } as Content,
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
  };
};

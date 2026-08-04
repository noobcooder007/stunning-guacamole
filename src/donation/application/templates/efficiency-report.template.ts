import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { EfficiencyReportResponseDto } from '@/donation/application/dto/efficiency-report.response.dto';

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

function rate(value: number | null): string {
  if (value === null) return 'N/D';
  return `${Number(value).toFixed(2)}%`;
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

const filterRow = (label: string, value: string): Content => ({
  columns: [
    { text: label, fontSize: 8, color: '#888888', width: 90 },
    { text: value, fontSize: 9, bold: true },
  ],
  margin: [0, 0, 0, 2],
});

export const efficiencyReportTemplate = (
  data: EfficiencyReportResponseDto,
  generatedAt: string,
): TDocumentDefinitions => {
  const periodLabel = `${MONTH_LABELS[data.month - 1]} ${data.year}`;

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
      text: fmt(c.pendingAmountConsolidatedMxn),
      fontSize: 9,
      alignment: 'right',
      color: '#e65100',
    },
    {
      text: rate(c.collectionRate),
      fontSize: 9,
      alignment: 'right',
      bold: true,
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
      text: fmt(data.totals.pendingAmountConsolidatedMxn),
      bold: true,
      fontSize: 9,
      alignment: 'right',
      color: '#e65100',
    },
    {
      text: rate(data.totals.collectionRate),
      bold: true,
      fontSize: 9,
      alignment: 'right',
    },
  ];

  return {
    content: [
      {
        text: 'REPORTE DE EFICIENCIA',
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
              filterRow('PERÍODO', periodLabel),
              filterRow(
                'RANGO DONATIVO',
                `${fmt(data.initialDonation)} - ${fmt(data.finalDonation)}`,
              ),
              filterRow('FRECUENCIA', `${data.frequency} MES(ES)`),
              ...(data.collectorNum
                ? [filterRow('COLECTOR', `No. ${data.collectorNum}`)]
                : []),
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
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
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
                text: 'PENDIENTE (MXN)',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'EFICIENCIA',
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

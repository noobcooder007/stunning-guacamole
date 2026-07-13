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

function fmt(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

function rate(value: number): string {
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
    { text: fmt(c.assignedAmount), fontSize: 9, alignment: 'right' },
    {
      text: fmt(c.collectedAmount),
      fontSize: 9,
      alignment: 'right',
      color: '#2e7d32',
    },
    {
      text: fmt(c.pendingAmount),
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
      text: fmt(data.totals.assignedAmount),
      bold: true,
      fontSize: 9,
      alignment: 'right',
    },
    {
      text: fmt(data.totals.collectedAmount),
      bold: true,
      fontSize: 9,
      alignment: 'right',
      color: '#2e7d32',
    },
    {
      text: fmt(data.totals.pendingAmount),
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
                text: 'ASIGNADO',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'COBRADO',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'PENDIENTE',
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

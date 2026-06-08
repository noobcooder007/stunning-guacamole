import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { ReceiptsReportByPeriodResponseDto } from '@/donation/application/dto/receipts-report-by-period.response.dto';

const MONTH_LABELS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

function fmt(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

const divider = (width: number): Content => ({
  canvas: [{ type: 'line', x1: 0, y1: 0, x2: width, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }],
  margin: [0, 0, 0, 6],
});

export const receiptsReportByPeriodTemplate = (
  data: ReceiptsReportByPeriodResponseDto,
  generatedAt: string,
): TDocumentDefinitions => {
  const periodLabel = `${MONTH_LABELS[data.month - 1]} ${data.year}`;

  const collectorRows: Content[][] = data.collectors.map((c) => [
    { text: String(c.collectorNumber), fontSize: 9, alignment: 'center' },
    { text: c.collectorName, fontSize: 9 },
    { text: fmt(c.accumulatedAmount), fontSize: 9, alignment: 'right' },
  ]);

  const totalsRow: Content[] = [
    { text: 'TOTAL', bold: true, fontSize: 9, colSpan: 2, alignment: 'right' } as any,
    {} as any,
    { text: fmt(data.totalAccumulatedAmount), bold: true, fontSize: 9, alignment: 'right' },
  ];

  return {
    content: [
      {
        text: 'REPORTE DE RECIBOS POR COLECTOR',
        bold: true, fontSize: 11, alignment: 'center', color: '#333333',
        margin: [0, 0, 0, 4],
      },
      divider(515),
      {
        columns: [
          {
            stack: [
              { text: 'PERÍODO', fontSize: 8, color: '#888888' },
              { text: periodLabel, bold: true, fontSize: 13, margin: [0, 2, 0, 0] },
            ],
          },
          {
            stack: [
              { text: 'GENERADO', fontSize: 8, color: '#888888', alignment: 'right' },
              { text: generatedAt, fontSize: 9, alignment: 'right', margin: [0, 2, 0, 0] },
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
          widths: ['auto', '*', 'auto'],
          body: [
            [
              { text: 'NO.', bold: true, fontSize: 8, alignment: 'center', color: '#555555' },
              { text: 'COLECTOR', bold: true, fontSize: 8, color: '#555555' },
              { text: 'MONTO ACUMULADO', bold: true, fontSize: 8, alignment: 'right', color: '#555555' },
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

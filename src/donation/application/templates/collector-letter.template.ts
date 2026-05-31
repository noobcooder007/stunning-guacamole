import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export interface CollectorLetterReceiptRow {
  folio: string;
  beneficientName: string;
  beneficientNumber: number;
  amount: number;
  currency: string;
  recurrence: string;
}

export interface CollectorLetterData {
  collectorName: string;
  collectorNumber: number;
  period: string;
  receipts: CollectorLetterReceiptRow[];
  totalAmount: number;
  currency: string;
}

function fmt(amount: number, currency: string): string {
  return `$${Number(amount).toFixed(2)} ${currency}`;
}

const divider = (width: number): Content => ({
  canvas: [
    {
      type: 'line',
      x1: 0, y1: 0, x2: width, y2: 0,
      lineWidth: 0.5,
      lineColor: '#cccccc',
    },
  ],
  margin: [0, 0, 0, 6],
});

export const collectorLetterTemplate = (
  letters: CollectorLetterData[],
): TDocumentDefinitions => ({
  content: letters.map((letter, index) =>
    buildLetter(letter, index < letters.length - 1),
  ),
  defaultStyle: { font: 'Roboto', fontSize: 10 },
});

function buildLetter(
  letter: CollectorLetterData,
  addPageBreak: boolean,
): Content {
  const rows: Content[][] = letter.receipts.map((r) => [
    { text: r.folio, fontSize: 8, color: '#555555' },
    { text: r.beneficientName, fontSize: 9 },
    { text: String(r.beneficientNumber), fontSize: 9, alignment: 'center', color: '#555555' },
    { text: fmt(r.amount, r.currency), fontSize: 9, alignment: 'right', bold: true },
    { text: r.recurrence, fontSize: 8, alignment: 'center', color: '#888888' },
  ]);

  return {
    stack: [
      {
        text: 'CARTA DE RECIBOS ENTREGADOS',
        bold: true,
        fontSize: 9,
        alignment: 'center',
        color: '#555555',
        margin: [0, 0, 0, 4],
      },
      divider(515),
      {
        columns: [
          {
            stack: [
              { text: 'COLECTOR', fontSize: 8, color: '#888888' },
              { text: letter.collectorName, bold: true, fontSize: 13, margin: [0, 2, 0, 0] },
            ],
          },
          {
            stack: [
              { text: 'No. COLECTOR', fontSize: 8, color: '#888888', alignment: 'right' },
              {
                text: String(letter.collectorNumber),
                bold: true,
                fontSize: 13,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            stack: [
              { text: 'PERIODO', fontSize: 8, color: '#888888', alignment: 'right' },
              {
                text: letter.period,
                bold: true,
                fontSize: 13,
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
          widths: ['25%', '*', '8%', '17%', '12%'],
          body: [
            [
              { text: 'FOLIO', bold: true, fontSize: 8, color: '#555555' },
              { text: 'BIENHECHOR', bold: true, fontSize: 8, color: '#555555' },
              { text: 'No.', bold: true, fontSize: 8, alignment: 'center', color: '#555555' },
              { text: 'IMPORTE', bold: true, fontSize: 8, alignment: 'right', color: '#555555' },
              { text: 'RECURRENCIA', bold: true, fontSize: 8, alignment: 'center', color: '#555555' },
            ],
            ...rows,
          ],
        },
        margin: [0, 0, 0, 6],
      },
      divider(515),
      {
        columns: [
          {
            text: `${letter.receipts.length} recibo${letter.receipts.length !== 1 ? 's' : ''}`,
            fontSize: 8,
            color: '#888888',
          },
          {
            text: `TOTAL: ${fmt(letter.totalAmount, letter.currency)}`,
            bold: true,
            fontSize: 12,
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 48],
      },
      {
        columns: [
          {
            stack: [
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5, lineColor: '#555555' },
                ],
              },
              {
                text: 'Firma del colector',
                alignment: 'center',
                fontSize: 8,
                color: '#888888',
                margin: [0, 4, 0, 0],
              },
            ],
            width: 200,
          },
          { text: '', width: '*' },
          {
            stack: [
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5, lineColor: '#555555' },
                ],
              },
              {
                text: 'Recibido conforme',
                alignment: 'center',
                fontSize: 8,
                color: '#888888',
                margin: [0, 4, 0, 0],
              },
            ],
            width: 200,
          },
        ],
      },
    ],
    pageBreak: addPageBreak ? 'after' : undefined,
  };
}

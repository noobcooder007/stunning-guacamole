import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export interface CollectorLetterReceiptRow {
  folio: string;
  beneficientName: string;
  beneficientNumber: number;
  amount: number;
  currency: string;
  recurrence: string;
}

export interface CollectorLetterOverdueRow extends CollectorLetterReceiptRow {
  period: string;
}

export interface CollectorLetterData {
  collectorName: string;
  collectorNumber: number;
  period: string;
  receipts: CollectorLetterReceiptRow[];
  totalAmount: number;
  currency: string;
  overdueReceipts?: CollectorLetterOverdueRow[];
  overdueTotal?: number;
}

function fmt(amount: number, currency: string): string {
  return `$${Number(amount).toFixed(2)} ${currency}`;
}

const divider = (): Content => ({
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 515,
      y2: 0,
      lineWidth: 0.5,
      lineColor: '#cccccc',
    },
  ],
  margin: [0, 0, 0, 6],
});

function summaryRow(
  label: string,
  value: string,
  valueColor?: string,
): Content {
  return {
    columns: [
      { text: label, fontSize: 8, color: '#888888', width: 90 },
      { text: value, fontSize: 9, bold: true, color: valueColor ?? '#222222' },
    ],
    margin: [0, 0, 0, 3],
  };
}

export const collectorLetterTemplate = (
  letters: CollectorLetterData[],
): TDocumentDefinitions => ({
  pageMargins: [40, 40, 40, 40],
  content: letters.map((letter, index) =>
    buildLetter(letter, index < letters.length - 1),
  ),
  defaultStyle: { font: 'Roboto', fontSize: 9 },
});

function buildLetter(
  letter: CollectorLetterData,
  addPageBreak: boolean,
): Content {
  const overdue = letter.overdueReceipts ?? [];
  const overdueTotal = letter.overdueTotal ?? 0;
  const hasOverdue = overdue.length > 0;
  const grandTotal = letter.totalAmount + overdueTotal;

  const firstFolio = letter.receipts[0]?.folio ?? '—';
  const lastFolio = letter.receipts[letter.receipts.length - 1]?.folio ?? '—';
  const folioRange =
    firstFolio === lastFolio ? firstFolio : `${firstFolio}  a  ${lastFolio}`;

  const overduePeriods = hasOverdue
    ? [...new Set(overdue.map((r) => r.period))].join(', ')
    : '';

  const overdueSection: Content[] = hasOverdue
    ? [
        divider(),
        {
          text: 'RECIBOS ATRASADOS SIN PAGAR',
          bold: true,
          fontSize: 8,
          color: '#c0392b',
          margin: [0, 0, 0, 6],
        },
        summaryRow('Periodos:', overduePeriods, '#c0392b'),
        summaryRow(
          'Cantidad:',
          `${overdue.length} recibo${overdue.length !== 1 ? 's' : ''}`,
          '#c0392b',
        ),
        summaryRow(
          'Total atrasado:',
          fmt(overdueTotal, letter.currency),
          '#c0392b',
        ),
      ]
    : [];

  return {
    stack: [
      {
        text: 'CARTA DE RECIBOS ENTREGADOS',
        bold: true,
        fontSize: 10,
        alignment: 'center',
        color: '#444444',
        margin: [0, 0, 0, 6],
      },
      divider(),
      {
        columns: [
          {
            stack: [
              { text: 'COLECTOR', fontSize: 7, color: '#888888' },
              {
                text: letter.collectorName,
                bold: true,
                fontSize: 12,
                margin: [0, 1, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'No. COLECTOR',
                fontSize: 7,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: String(letter.collectorNumber),
                bold: true,
                fontSize: 12,
                alignment: 'right',
                margin: [0, 1, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'PERIODO',
                fontSize: 7,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: letter.period,
                bold: true,
                fontSize: 12,
                alignment: 'right',
                margin: [0, 1, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      divider(),
      {
        text: `RECIBOS DEL PERIODO ${letter.period}`,
        bold: true,
        fontSize: 8,
        color: '#555555',
        margin: [0, 0, 0, 6],
      },
      summaryRow('Folios:', folioRange),
      summaryRow(
        'Cantidad:',
        `${letter.receipts.length} recibo${letter.receipts.length !== 1 ? 's' : ''}`,
      ),
      summaryRow(
        'Total del periodo:',
        fmt(letter.totalAmount, letter.currency),
      ),
      ...overdueSection,
      divider(),
      {
        columns: [
          { text: '', width: '*' },
          {
            text: `TOTAL A COBRAR: ${fmt(grandTotal, letter.currency)}`,
            bold: true,
            fontSize: 13,
            alignment: 'right',
          },
        ],
        margin: [0, 4, 0, 40],
      },
      {
        columns: [
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 180,
                    y2: 0,
                    lineWidth: 0.5,
                    lineColor: '#555555',
                  },
                ],
              },
              {
                text: 'Firma del colector',
                alignment: 'center',
                fontSize: 7,
                color: '#888888',
                margin: [0, 3, 0, 0],
              },
            ],
            width: 200,
          },
          { text: '', width: '*' },
          {
            stack: [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 180,
                    y2: 0,
                    lineWidth: 0.5,
                    lineColor: '#555555',
                  },
                ],
              },
              {
                text: 'Recibido conforme',
                alignment: 'center',
                fontSize: 7,
                color: '#888888',
                margin: [0, 3, 0, 0],
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

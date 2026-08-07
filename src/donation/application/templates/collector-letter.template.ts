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
  totalAmountMxn: number;
  totalAmountUsd: number;
  overdueReceipts?: CollectorLetterOverdueRow[];
  overdueTotalMxn?: number;
  overdueTotalUsd?: number;
}

function fmt(amount: number, currency: string): string {
  return `$${Number(amount).toFixed(2)} ${currency}`;
}

// Los montos en MXN y USD nunca se suman entre sí: se muestran como líneas
// separadas, y la línea de una moneda se omite cuando esa moneda no aplica.
function fmtByCurrency(mxn: number, usd: number): string {
  const parts: string[] = [];
  if (mxn !== 0 || usd === 0) parts.push(fmt(mxn, 'MXN'));
  if (usd !== 0) parts.push(fmt(usd, 'USD'));
  return parts.join('  +  ');
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
  const overdueTotalMxn = letter.overdueTotalMxn ?? 0;
  const overdueTotalUsd = letter.overdueTotalUsd ?? 0;
  const hasOverdue = overdue.length > 0;
  const grandTotalMxn = letter.totalAmountMxn + overdueTotalMxn;
  const grandTotalUsd = letter.totalAmountUsd + overdueTotalUsd;

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
          fmtByCurrency(overdueTotalMxn, overdueTotalUsd),
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
        fmtByCurrency(letter.totalAmountMxn, letter.totalAmountUsd),
      ),
      ...overdueSection,
      divider(),
      {
        columns: [
          { text: '', width: '*' },
          {
            text: `TOTAL A COBRAR: ${fmtByCurrency(grandTotalMxn, grandTotalUsd)}`,
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

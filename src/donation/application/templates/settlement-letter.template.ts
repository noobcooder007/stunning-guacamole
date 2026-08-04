import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export interface SettlementLetterReceiptRow {
  folio: string;
  beneficientName: string;
  beneficientNumber: number;
  amount: number;
  currency: string;
  periodLabel: string;
}

export interface SettlementLetterData {
  collectorName: string;
  collectorNumber: number;
  periodLabel: string;
  receipts: SettlementLetterReceiptRow[];
  totalCollected: number;
  commissionPercent: number;
  commissionAmount: number;
  nomina: number;
  transportAllowance: number;
  netCommission: number;
  currency: string;
  // Solo presente cuando la liquidación incluye recibos en USD convertidos a MXN.
  exchangeRateUsdToMxn?: number;
}

function fmt(amount: number, currency: string): string {
  return `$${Number(amount).toFixed(2)} ${currency}`;
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

export const settlementLetterTemplate = (
  letters: SettlementLetterData[],
): TDocumentDefinitions => ({
  content: letters.map((letter, index) =>
    buildLetter(letter, index < letters.length - 1),
  ),
  defaultStyle: { font: 'Roboto', fontSize: 10 },
});

function buildLetter(
  letter: SettlementLetterData,
  addPageBreak: boolean,
): Content {
  const rows: Content[][] = letter.receipts.map((r) => [
    { text: r.folio, fontSize: 8, color: '#555555' },
    { text: r.beneficientName, fontSize: 9 },
    {
      text: String(r.beneficientNumber),
      fontSize: 9,
      alignment: 'center',
      color: '#555555',
    },
    { text: r.periodLabel, fontSize: 8, alignment: 'center', color: '#888888' },
    {
      text: fmt(r.amount, r.currency),
      fontSize: 9,
      alignment: 'right',
      bold: true,
    },
  ]);

  return {
    stack: [
      {
        text: 'CARTA DE LIQUIDACIÓN',
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
              {
                text: letter.collectorName,
                bold: true,
                fontSize: 13,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'No. COLECTOR',
                fontSize: 8,
                color: '#888888',
                alignment: 'right',
              },
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
              {
                text: 'PERIODO',
                fontSize: 8,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: letter.periodLabel,
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
          widths: ['25%', '*', '8%', '12%', '17%'],
          body: [
            [
              { text: 'FOLIO', bold: true, fontSize: 8, color: '#555555' },
              { text: 'BIENHECHOR', bold: true, fontSize: 8, color: '#555555' },
              {
                text: 'No.',
                bold: true,
                fontSize: 8,
                alignment: 'center',
                color: '#555555',
              },
              {
                text: 'PERIODO',
                bold: true,
                fontSize: 8,
                alignment: 'center',
                color: '#555555',
              },
              {
                text: 'IMPORTE',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
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
            text: `${letter.receipts.length} recibo${letter.receipts.length !== 1 ? 's' : ''} cobrado${letter.receipts.length !== 1 ? 's' : ''}`,
            fontSize: 8,
            color: '#888888',
          },
          {
            text: `TOTAL COBRADO: ${fmt(letter.totalCollected, letter.currency)}`,
            bold: true,
            fontSize: 12,
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, letter.exchangeRateUsdToMxn ? 2 : 8],
      },
      ...(letter.exchangeRateUsdToMxn
        ? [
            {
              text: `Incluye recibos en USD, tipo de cambio aplicado: $${letter.exchangeRateUsdToMxn.toFixed(4)} MXN por USD`,
              fontSize: 7,
              color: '#888888',
              alignment: 'right' as const,
              margin: [0, 0, 0, 8] as [number, number, number, number],
            },
          ]
        : []),
      {
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              {
                text: 'Porcentaje de comisión',
                fontSize: 9,
                color: '#555555',
                border: [false, false, false, false],
              },
              {
                text: `${letter.commissionPercent}%`,
                bold: true,
                fontSize: 11,
                alignment: 'right',
                border: [false, false, false, false],
              },
              { text: '', border: [false, false, false, false] },
            ],
            [
              {
                text: 'Comisión bruta',
                fontSize: 9,
                color: '#555555',
                border: [false, false, false, false],
              },
              {
                text: fmt(letter.commissionAmount, letter.currency),
                fontSize: 10,
                alignment: 'right',
                border: [false, false, false, false],
                colSpan: 2,
              },
              {},
            ],
            [
              {
                text: '(–) Nómina',
                fontSize: 9,
                color: '#555555',
                border: [false, false, false, false],
              },
              {
                text: fmt(letter.nomina, letter.currency),
                fontSize: 10,
                alignment: 'right',
                color: '#cc0000',
                border: [false, false, false, false],
                colSpan: 2,
              },
              {},
            ],
            [
              {
                text: '(+) Apoyo de transporte',
                fontSize: 9,
                color: '#555555',
                border: [false, false, false, false],
              },
              {
                text: fmt(letter.transportAllowance, letter.currency),
                fontSize: 10,
                alignment: 'right',
                color: '#007700',
                border: [false, false, false, false],
                colSpan: 2,
              },
              {},
            ],
            [
              {
                text: 'COMISIÓN NETA A PAGAR',
                bold: true,
                fontSize: 10,
                color: '#333333',
                fillColor: '#f5f5f5',
                border: [false, false, false, false],
                margin: [4, 4, 0, 4],
              },
              {
                text: fmt(letter.netCommission, letter.currency),
                bold: true,
                fontSize: 14,
                alignment: 'right',
                fillColor: '#f5f5f5',
                border: [false, false, false, false],
                margin: [0, 4, 4, 4],
                colSpan: 2,
              },
              {},
            ],
          ],
        },
        margin: [0, 0, 0, 40],
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

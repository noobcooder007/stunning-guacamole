import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { MaskHelper } from '@/shared/infrastructure/utils/mask-helper.util';

export interface ReceiptData {
  folio: string;
  printCount: number;
  recurrence: string;
  period: string;
  amount: number;
  currency: string;
  donorName: string;
  addressDonor: string;
  telephoneDonor: string;
  chainValidator: string;
  collector: number;
  beneficient: number;
  photoCollector: string;
  keepPrivate: boolean;
}

function fmt(amount: number, currency: string): string {
  return `$${Number(amount).toFixed(2)} ${currency}`;
}

export const receiptTemplate = (
  receipts: ReceiptData[],
): TDocumentDefinitions => ({
  content: receipts.map((r) =>
    createReceipt(r, r.printCount > 0, r.keepPrivate),
  ),
});

function createReceipt(
  receipt: ReceiptData,
  showWatermark: boolean = false,
  keepPrivate: boolean = false,
): Content {
  return {
    stack: [
      {
        layout: 'noBorders',
        table: {
          widths: ['50%', '50%'],
          heights: 245,
          dontBreakRows: true,
          body: [
            [
              // ── TALÓN (izquierda) ──────────────────────────────────────
              {
                stack: [
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    bold: true,
                    fontSize: 9,
                    margin: [0, 4, 0, 4],
                  },
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0, y1: 0, x2: 250, y2: 0,
                        lineWidth: 0.5,
                        lineColor: '#cccccc',
                      },
                    ],
                    margin: [0, 0, 0, 8],
                  },
                  {
                    text: `${receipt.recurrence}  ${receipt.period}`,
                    fontSize: 8,
                    color: '#888888',
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `DONATIVO: ${fmt(receipt.amount, receipt.currency)}`,
                    alignment: 'right',
                    bold: true,
                    fontSize: 15,
                    margin: [0, 0, 0, 6],
                  },
                  {
                    text: receipt.donorName,
                    bold: true,
                    fontSize: 12,
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: receipt.addressDonor,
                    fontSize: 8,
                    color: '#666666',
                    margin: [0, 0, 0, 1],
                  },
                  {
                    text: receipt.telephoneDonor,
                    fontSize: 8,
                    color: '#666666',
                    margin: [0, 0, 0, 4],
                  },
                  {
                    text: `COLECTOR: ${receipt.collector}`,
                    fontSize: 8,
                    color: '#555555',
                  },
                  receipt.beneficient && {
                    text: `BIENHECHOR: ${receipt.beneficient}`,
                    fontSize: 8,
                    color: '#555555',
                  },
                  {
                    qr: receipt.folio,
                    fit: 50,
                    foreground: 'black',
                    background: 'white',
                    eccLevel: 'M',
                    alignment: 'center',
                    margin: [0, 12, 0, 10],
                  },
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    fontSize: 7,
                    color: '#aaaaaa',
                  },
                ],
              },

              // ── RECIBO PRINCIPAL (derecha) ─────────────────────────────
              {
                stack: [
                  showWatermark
                    ? {
                        relativePosition: { x: 0, y: 40 },
                        stack: [
                          {
                            text: `DUPLICADO / REIMPRESIÓN #${receipt.printCount}`,
                            alignment: 'center',
                            bold: true,
                            fontSize: 22,
                            color: 'red',
                            opacity: 0.15,
                          },
                          {
                            text: 'DOCUMENTO VÁLIDO ÚNICAMENTE PARA CONTROL INTERNO',
                            alignment: 'center',
                            bold: true,
                            fontSize: 7,
                            color: 'red',
                            opacity: 0.15,
                          },
                        ],
                        width: 200,
                      }
                    : [],
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    bold: true,
                    fontSize: 9,
                    margin: [0, 4, 0, 4],
                  },
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0, y1: 0, x2: 250, y2: 0,
                        lineWidth: 0.5,
                        lineColor: '#cccccc',
                      },
                    ],
                    margin: [0, 0, 0, 6],
                  },
                  {
                    text: `DONATIVO: ${fmt(receipt.amount, receipt.currency)}`,
                    alignment: 'right',
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 4],
                  },
                  {
                    columns: [
                      {
                        width: '*',
                        stack: [
                          {
                            text: `${receipt.recurrence}  ${receipt.period}`,
                            fontSize: 8,
                            color: '#888888',
                            margin: [0, 0, 0, 2],
                          },
                          {
                            text: keepPrivate
                              ? MaskHelper.mask(receipt.donorName)
                              : receipt.donorName,
                            bold: true,
                            fontSize: 13,
                            margin: [0, 0, 0, 2],
                          },
                          {
                            text: keepPrivate
                              ? `******${receipt.addressDonor.slice(-4)}`
                              : receipt.addressDonor,
                            fontSize: 8,
                            color: '#666666',
                            margin: [0, 0, 0, 1],
                          },
                          {
                            text: keepPrivate
                              ? MaskHelper.mask(receipt.telephoneDonor)
                              : receipt.telephoneDonor,
                            fontSize: 8,
                            color: '#666666',
                          },
                        ],
                      },
                      {
                        width: '80',
                        stack: [
                          receipt.photoCollector
                            ? {
                                image: receipt.photoCollector,
                                width: 70,
                                height: 70,
                                alignment: 'center',
                              }
                            : { text: '' },
                        ],
                      },
                    ],
                  },
                  {
                    text: `CADENA DE VALIDACIÓN: ${receipt.chainValidator}`,
                    alignment: 'right',
                    fontSize: 7,
                    color: '#aaaaaa',
                    margin: [0, 14, 0, 6],
                  },
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    fontSize: 7,
                    color: '#aaaaaa',
                  },
                ],
              },
            ],
          ],
        },
      },
    ],
  };
}

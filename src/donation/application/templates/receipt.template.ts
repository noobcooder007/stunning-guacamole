import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

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
}

export const receiptTemplate = (
  receipts: ReceiptData[],
): TDocumentDefinitions => {
  const styles = {
    watermark: {
      fontSize: 45,
      bold: true,
      color: 'red',
      opacity: 0.15,
      characterSpacing: 2,
    },
  };
  return {
    styles: styles,
    content: receipts.map((receipt) =>
      createReceipt(receipt, receipt.printCount > 0),
    ),
  };
};

function createReceipt(
  receipt: ReceiptData,
  showWatermark: boolean = false,
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
              {
                stack: [
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    bold: true,
                    margin: [0, 0, 0, 10],
                  },
                  {
                    text: `${receipt.recurrence} ${receipt.period}`,
                  },
                  {
                    text: `DONATIVO: $${receipt.amount}${receipt.currency}`,
                    alignment: 'right',
                    bold: true,
                    fontSize: 16,
                  },
                  {
                    text: receipt.donorName,
                    bold: true,
                    fontSize: 14,
                  },
                  {
                    text: receipt.addressDonor,
                  },
                  {
                    text: receipt.telephoneDonor,
                  },
                  {
                    text: `COLECTOR: ${receipt.collector}`,
                  },
                  receipt.beneficient && {
                    text: `BIENHECHOR: ${receipt.beneficient}`,
                  },
                  {
                    qr: receipt.folio,
                    fit: 50,
                    foreground: 'black',
                    background: 'white',
                    eccLevel: 'M',
                    alignment: 'center',
                    margin: [0, 20, 0, 20],
                  },
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    bold: true,
                  },
                ],
              },
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
                            fontSize: 24,
                            color: 'red',
                            opacity: 0.15,
                          },
                          {
                            text: 'DOCUMENTO VÁLIDO ÚNICAMENTE PARA CONTROL INTERNO',
                            alignment: 'center',
                            bold: true,
                            fontSize: 8,
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
                    margin: [0, 0, 0, 10],
                  },
                  {
                    text: `DONATIVO: $${receipt.amount}${receipt.currency}`,
                    alignment: 'right',
                    fontSize: 20,
                    bold: true,
                  },
                  {
                    columns: [
                      {
                        width: '*',
                        stack: [
                          {
                            text: `${receipt.recurrence} ${receipt.period}`,
                          },
                          {
                            text: receipt.donorName,
                            bold: true,
                            fontSize: 14,
                          },
                          {
                            text: receipt.addressDonor,
                          },
                          {
                            text: receipt.telephoneDonor,
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
                    margin: [0, 20, 0, 0],
                  },
                  {
                    text: receipt.folio,
                    alignment: 'center',
                    bold: true,
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

import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { BeneficientsReportItemDto } from '@/community/application/dto/beneficients-report.response';

function fmtDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function fmtMoney(amount: number): string {
  return `$${Number(amount).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtAddress(item: BeneficientsReportItemDto): string {
  const parts = [
    `${item.street} ${item.noExt}${item.noInt ? ` Int. ${item.noInt}` : ''}`,
    item.neighborhood ?? '',
    item.locality ?? '',
    `${item.city}, ${item.state} ${item.zipCode}`,
  ].filter(Boolean);
  return parts.join(', ');
}

const divider = (): Content => ({
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 555,
      y2: 0,
      lineWidth: 0.5,
      lineColor: '#cccccc',
    },
  ],
  margin: [0, 0, 0, 6],
});

const H = (
  text: string,
  align: 'left' | 'center' | 'right' = 'left',
): Content =>
  ({
    text,
    bold: true,
    fontSize: 6,
    color: '#555555',
    fillColor: '#f5f5f5',
    alignment: align,
  }) as Content;

const C = (
  text: string,
  align: 'left' | 'center' | 'right' = 'left',
): Content => ({ text, fontSize: 6, alignment: align }) as Content;

export interface BeneficientsReportPdfData {
  items: BeneficientsReportItemDto[];
  generatedAt: string;
  total: number;
}

export const beneficientsReportTemplate = (
  data: BeneficientsReportPdfData,
): TDocumentDefinitions => {
  const headerRow: Content[] = [
    H('NO.', 'center'),
    H('NOMBRE'),
    H('DOMICILIO'),
    H('DONACIONES', 'center'),
    H('F. BAJA', 'center'),
    H('ACUMULADO', 'right'),
  ];

  const rows: Content[][] = data.items.map((b) => [
    C(String(b.beneficientNumber), 'center'),
    C(
      `${b.title ? b.title + ' ' : ''}${b.firstname} ${b.firstLastname}${b.secondLastname ? ' ' + b.secondLastname : ''}`,
    ),
    C(fmtAddress(b)),
    C(String(b.donationCount), 'center'),
    C(fmtDate(b.deactivatedAt), 'center'),
    C(fmtMoney(b.donationTotal), 'right'),
  ]);

  return {
    pageMargins: [20, 30, 20, 30],
    content: [
      {
        text: 'REPORTE DE BIENHECHORES',
        bold: true,
        fontSize: 11,
        alignment: 'center',
        color: '#333333',
        margin: [0, 0, 0, 4],
      },
      divider(),
      {
        columns: [
          {
            stack: [
              { text: 'TOTAL DE REGISTROS', fontSize: 7, color: '#888888' },
              {
                text: String(data.total),
                bold: true,
                fontSize: 11,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'GENERADO',
                fontSize: 7,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: data.generatedAt,
                fontSize: 8,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 8],
      },
      divider(),
      {
        layout: 'letterTable',
        table: {
          headerRows: 1,
          widths: [
            'auto',
            '*',
            '*',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            '*',
            'auto',
            'auto',
          ],
          body: [headerRow, ...rows],
        },
        margin: [0, 0, 0, 4],
      } as Content,
    ],
    defaultStyle: { font: 'Roboto', fontSize: 7 },
  };
};

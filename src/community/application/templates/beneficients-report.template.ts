import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { BeneficientsReportItemDto } from '@/community/application/dto/beneficients-report.response';

const RECURRENCE_LABELS: Record<number, string> = {
  1: 'Mensual',
  2: 'Bimestral',
  3: 'Trimestral',
  4: 'Cuatrimestral',
  6: 'Semestral',
  12: 'Anual',
};

function fmtAddress(item: BeneficientsReportItemDto): string {
  const parts = [
    `${item.street} ${item.noExt}${item.noInt ? ` Int. ${item.noInt}` : ''}`,
    item.neighborhood ?? '',
    item.locality ?? '',
    `${item.city}, ${item.state} ${item.zipCode}`,
  ].filter(Boolean);
  return parts.join(', ');
}

function fmtRecurrence(
  recurrence: number | null,
  recurring: boolean | null,
): string {
  if (!recurring) return 'Única vez';
  if (!recurrence) return '—';
  return RECURRENCE_LABELS[recurrence] ?? `Cada ${recurrence} mes(es)`;
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
    fontSize: 7,
    color: '#555555',
    fillColor: '#f5f5f5',
    alignment: align,
  }) as Content;

const C = (
  text: string,
  align: 'left' | 'center' | 'right' = 'left',
): Content => ({ text, fontSize: 7, alignment: align }) as Content;

export interface BeneficientsReportPdfData {
  items: BeneficientsReportItemDto[];
  generatedAt: string;
  total: number;
}

export const beneficientsReportTemplate = (
  data: BeneficientsReportPdfData,
): TDocumentDefinitions => {
  const headerRow: Content[] = [
    H('NO. BIENHECHOR', 'center'),
    H('NOMBRE'),
    H('TELÉFONO', 'center'),
    H('DOMICILIO'),
    H('DONATIVOS', 'center'),
    H('NO. COLECTOR', 'center'),
    H('RECURRENCIA', 'center'),
  ];

  const rows: Content[][] = data.items.map((b) => [
    C(String(b.beneficientNumber), 'center'),
    C(
      `${b.title ? b.title + ' ' : ''}${b.firstname} ${b.firstLastname}${b.secondLastname ? ' ' + b.secondLastname : ''}`,
    ),
    C(b.phoneNumber ?? '—', 'center'),
    C(fmtAddress(b)),
    C(String(b.donationCount), 'center'),
    C(b.collectorNumber ? String(b.collectorNumber) : '—', 'center'),
    C(fmtRecurrence(b.recurrence, b.recurring), 'center'),
  ]);

  return {
    pageMargins: [20, 30, 20, 30],
    content: [
      {
        text: 'REPORTE DE BIENHECHORES',
        bold: true,
        fontSize: 12,
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
          widths: ['auto', '*', 'auto', '*', 'auto', 'auto', 'auto'],
          body: [headerRow, ...rows],
        },
        margin: [0, 0, 0, 4],
      } as Content,
    ],
    defaultStyle: { font: 'Roboto', fontSize: 8 },
  };
};

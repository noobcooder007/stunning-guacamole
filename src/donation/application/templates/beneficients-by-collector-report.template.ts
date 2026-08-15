import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  BeneficientReportItemDto,
  BeneficientsByCollectorReportResponseDto,
  PeriodDonationReportDto,
  ReceiptLineReportDto,
} from '@/donation/application/dto/beneficients-by-collector-report.response.dto';

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

function periodLabel(month: number, year: number): string {
  return `${MONTH_LABELS[month - 1]} ${year}`;
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

const sectionTitle = (text: string): Content => ({
  text,
  bold: true,
  fontSize: 10,
  color: '#333333',
  fillColor: '#f5f5f5',
  margin: [0, 10, 0, 4],
});

function paymentStatusCell(receipt: ReceiptLineReportDto): Content {
  if (receipt.isDelayed === null) {
    return {
      text: 'SIN PERIODO DE COBRO VINCULADO',
      fontSize: 8,
      color: '#888888',
      italics: true,
    };
  }
  if (receipt.isDelayed) {
    return {
      text: `RETRASADO (pagado en ${periodLabel(
        receipt.paidPeriodMonth!,
        receipt.paidPeriodYear!,
      )})`,
      fontSize: 8,
      color: '#e65100',
      bold: true,
    };
  }
  return { text: 'A TIEMPO', fontSize: 8, color: '#2e7d32' };
}

function beneficientRows(periods: PeriodDonationReportDto[]): Content[][] {
  const rows: Content[][] = [];
  for (const period of periods) {
    for (const receipt of period.receipts) {
      rows.push([
        {
          text: periodLabel(period.periodMonth, period.periodYear),
          fontSize: 8,
        },
        {
          text: receipt.type === 'RECURRING' ? 'RECURRENTE' : 'ESPECIAL',
          fontSize: 8,
          alignment: 'center',
        },
        { text: receipt.folio, fontSize: 8 },
        {
          text: `${fmt(receipt.amount)} ${receipt.currency}`,
          fontSize: 8,
          alignment: 'right',
        },
        paymentStatusCell(receipt),
      ]);
    }
  }
  return rows;
}

function beneficientBlock(beneficient: BeneficientReportItemDto): Content[] {
  return [
    {
      columns: [
        {
          text: `${beneficient.beneficientNumber} — ${beneficient.beneficientName}`,
          bold: true,
          fontSize: 9,
        },
        {
          text: [
            beneficient.totalDonatedMxn > 0
              ? `${fmt(beneficient.totalDonatedMxn)} MXN`
              : null,
            beneficient.totalDonatedUsd > 0
              ? `${fmt(beneficient.totalDonatedUsd)} USD`
              : null,
          ]
            .filter(Boolean)
            .join('  ·  '),
          bold: true,
          fontSize: 9,
          alignment: 'right',
        },
      ],
      margin: [0, 6, 0, 2],
    },
    {
      layout: 'letterTable',
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', '*'],
        body: [
          [
            { text: 'PERIODO', bold: true, fontSize: 7, color: '#555555' },
            {
              text: 'TIPO',
              bold: true,
              fontSize: 7,
              alignment: 'center',
              color: '#555555',
            },
            { text: 'FOLIO', bold: true, fontSize: 7, color: '#555555' },
            {
              text: 'MONTO',
              bold: true,
              fontSize: 7,
              alignment: 'right',
              color: '#555555',
            },
            {
              text: 'ESTADO DE PAGO',
              bold: true,
              fontSize: 7,
              color: '#555555',
            },
          ],
          ...beneficientRows(beneficient.periods),
        ],
      },
      margin: [0, 0, 0, 2],
    } as Content,
  ];
}

export const beneficientsByCollectorReportTemplate = (
  data: BeneficientsByCollectorReportResponseDto,
  generatedAt: string,
): TDocumentDefinitions => {
  const rangeLabel = `${periodLabel(data.fromMonth, data.fromYear)} — ${periodLabel(
    data.toMonth,
    data.toYear,
  )}`;

  const collectorBlocks: Content[] = data.collectors.flatMap((collector) => [
    sectionTitle(
      `COLECTOR ${collector.collectorNumber} — ${collector.collectorName}`,
    ),
    ...collector.beneficients.flatMap((beneficient) =>
      beneficientBlock(beneficient),
    ),
  ]);

  return {
    content: [
      {
        text: 'REPORTE DE BIENHECHORES POR COLECTOR',
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
              { text: 'PERIODO', fontSize: 8, color: '#888888' },
              {
                text: rangeLabel,
                bold: true,
                fontSize: 12,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            stack: [
              {
                text: 'DONACIONES ESPECIALES',
                fontSize: 8,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: data.includeSpecial ? 'INCLUIDAS' : 'EXCLUIDAS',
                bold: true,
                fontSize: 12,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
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
        margin: [0, 0, 0, 6],
      },
      divider(515),
      ...(collectorBlocks.length > 0
        ? collectorBlocks
        : ([
            {
              text: 'No hay donaciones pagadas en el rango seleccionado.',
              fontSize: 9,
              italics: true,
              color: '#888888',
              margin: [0, 10, 0, 0],
            },
          ] as Content[])),
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
  };
};

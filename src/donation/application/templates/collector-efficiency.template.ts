import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  CollectorEfficiencyResponseDto,
  PeriodEfficiencyDto,
  YearEfficiencyDto,
} from '@/donation/application/dto/collector-efficiency.response.dto';

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

function fmt(amount: number | null): string {
  if (amount === null) return 'N/D';
  return `$${Number(amount).toFixed(2)}`;
}

function rate(value: number | null): string {
  if (value === null) return 'N/D';
  return `${Number(value).toFixed(2)}%`;
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
  fontSize: 9,
  color: '#555555',
  margin: [0, 12, 0, 6],
});

export interface CollectorEfficiencyPdfData {
  collectorName: string;
  collectorNumber: number;
  generatedAt: string;
  efficiency: CollectorEfficiencyResponseDto;
}

export const collectorEfficiencyTemplate = (
  data: CollectorEfficiencyPdfData,
): TDocumentDefinitions => {
  const { efficiency } = data;

  const historicalRows: Content[][] = [
    [
      { text: 'Monto asignado', fontSize: 9 },
      {
        text: fmt(efficiency.historical.assignedAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
      },
      {
        text: String(efficiency.historical.assignedCount),
        fontSize: 9,
        alignment: 'center',
      },
    ],
    [
      { text: 'Monto cobrado', fontSize: 9 },
      {
        text: fmt(efficiency.historical.collectedAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
        color: '#2e7d32',
      },
      {
        text: String(efficiency.historical.collectedCount),
        fontSize: 9,
        alignment: 'center',
        color: '#2e7d32',
      },
    ],
    [
      { text: 'Pendiente por cobrar', fontSize: 9 },
      {
        text: fmt(efficiency.historical.pendingAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
        color: '#e65100',
      },
      {
        text: String(efficiency.historical.pendingCount),
        fontSize: 9,
        alignment: 'center',
        color: '#e65100',
      },
    ],
    [
      {
        text: 'Eficiencia de cobranza',
        bold: true,
        fontSize: 10,
        fillColor: '#f5f5f5',
      },
      {
        text: rate(efficiency.historical.collectionRate),
        bold: true,
        fontSize: 14,
        alignment: 'right',
        fillColor: '#f5f5f5',
        colSpan: 2,
      } as any,
      {} as any,
    ],
  ];

  const yearRows: Content[][] = efficiency.byYear.map(
    (y: YearEfficiencyDto) => [
      { text: String(y.year), fontSize: 9, bold: true },
      {
        text: fmt(y.assignedAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
      },
      {
        text: fmt(y.collectedAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
        color: '#2e7d32',
      },
      {
        text: fmt(y.pendingAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
        color: '#e65100',
      },
      {
        text: String(y.assignedCount),
        fontSize: 8,
        alignment: 'center',
        color: '#888888',
      },
      {
        text: String(y.collectedCount),
        fontSize: 8,
        alignment: 'center',
        color: '#2e7d32',
      },
      {
        text: rate(y.collectionRate),
        fontSize: 9,
        alignment: 'right',
        bold: true,
      },
    ],
  );

  const periodRows: Content[][] = efficiency.byPeriod.map(
    (p: PeriodEfficiencyDto) => [
      {
        text: `${MONTH_LABELS[p.month - 1]} ${p.year}`,
        fontSize: 9,
        bold: true,
      },
      {
        text: p.periodStatus === 'OPEN' ? 'ABIERTO' : 'CERRADO',
        fontSize: 7,
        alignment: 'center',
        color: p.periodStatus === 'OPEN' ? '#1565c0' : '#555555',
      },
      {
        text: fmt(p.assignedAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
      },
      {
        text: fmt(p.collectedAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
        color: '#2e7d32',
      },
      {
        text: fmt(p.pendingAmountConsolidatedMxn),
        fontSize: 9,
        alignment: 'right',
        color: '#e65100',
      },
      {
        text: String(p.assignedCount),
        fontSize: 8,
        alignment: 'center',
        color: '#888888',
      },
      {
        text: String(p.collectedCount),
        fontSize: 8,
        alignment: 'center',
        color: '#2e7d32',
      },
      {
        text: rate(p.collectionRate),
        fontSize: 9,
        alignment: 'right',
        bold: true,
      },
    ],
  );

  return {
    content: [
      {
        text: 'REPORTE DE EFICIENCIA DE COBRANZA',
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
              { text: 'COLECTOR', fontSize: 8, color: '#888888' },
              {
                text: data.collectorName,
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
                text: String(data.collectorNumber),
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
                text: 'GENERADO',
                fontSize: 8,
                color: '#888888',
                alignment: 'right',
              },
              {
                text: data.generatedAt,
                bold: false,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      divider(515),

      // HISTORICAL
      sectionTitle('RESUMEN HISTÓRICO'),
      {
        layout: 'noBorders',
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Concepto', bold: true, fontSize: 8, color: '#555555' },
              {
                text: 'Monto',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'Recibos',
                bold: true,
                fontSize: 8,
                alignment: 'center',
                color: '#555555',
              },
            ],
            ...historicalRows,
          ],
        },
        margin: [0, 0, 0, 4],
      },

      // BY YEAR
      ...(efficiency.byYear.length > 0
        ? [
            sectionTitle('POR AÑO'),
            {
              layout: 'letterTable',
              table: {
                headerRows: 1,
                widths: ['auto', '*', '*', '*', 'auto', 'auto', 'auto'],
                body: [
                  [
                    { text: 'AÑO', bold: true, fontSize: 8, color: '#555555' },
                    {
                      text: 'ASIGNADO (MXN)',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                    {
                      text: 'COBRADO (MXN)',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                    {
                      text: 'PENDIENTE (MXN)',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                    {
                      text: 'REC.',
                      bold: true,
                      fontSize: 8,
                      alignment: 'center',
                      color: '#555555',
                    },
                    {
                      text: 'COB.',
                      bold: true,
                      fontSize: 8,
                      alignment: 'center',
                      color: '#555555',
                    },
                    {
                      text: 'EFICIENCIA',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                  ],
                  ...yearRows,
                ],
              },
              margin: [0, 0, 0, 4],
            } as Content,
          ]
        : []),

      // BY PERIOD
      ...(efficiency.byPeriod.length > 0
        ? [
            sectionTitle('POR PERIODO DE COBRANZA'),
            {
              layout: 'letterTable',
              table: {
                headerRows: 1,
                widths: ['auto', 'auto', '*', '*', '*', 'auto', 'auto', 'auto'],
                body: [
                  [
                    {
                      text: 'PERIODO',
                      bold: true,
                      fontSize: 8,
                      color: '#555555',
                    },
                    {
                      text: 'ESTADO',
                      bold: true,
                      fontSize: 8,
                      alignment: 'center',
                      color: '#555555',
                    },
                    {
                      text: 'ASIGNADO (MXN)',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                    {
                      text: 'COBRADO (MXN)',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                    {
                      text: 'PENDIENTE (MXN)',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                    {
                      text: 'REC.',
                      bold: true,
                      fontSize: 8,
                      alignment: 'center',
                      color: '#555555',
                    },
                    {
                      text: 'COB.',
                      bold: true,
                      fontSize: 8,
                      alignment: 'center',
                      color: '#555555',
                    },
                    {
                      text: 'EFICIENCIA',
                      bold: true,
                      fontSize: 8,
                      alignment: 'right',
                      color: '#555555',
                    },
                  ],
                  ...periodRows,
                ],
              },
              margin: [0, 0, 0, 4],
            } as Content,
          ]
        : []),
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
  };
};

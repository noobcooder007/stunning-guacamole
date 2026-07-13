import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { EfficiencyConcentratedReportResponseDto } from '@/donation/application/dto/efficiency-concentrated-report.response.dto';

function fmt(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

function rate(value: number): string {
  return `${Number(value).toFixed(2)}%`;
}

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

const filterRow = (label: string, value: string): Content => ({
  columns: [
    { text: label, fontSize: 8, color: '#888888', width: 90 },
    { text: value, fontSize: 9, bold: true },
  ],
  margin: [0, 0, 0, 2],
});

export const efficiencyConcentratedReportTemplate = (
  data: EfficiencyConcentratedReportResponseDto,
  generatedAt: string,
): TDocumentDefinitions => {
  const rows: Content[][] = data.rows.map((r) => [
    { text: String(r.collectorNumber), fontSize: 9, alignment: 'center' },
    { text: r.collectorName, fontSize: 9 },
    { text: r.groupLabel, fontSize: 9 },
    { text: fmt(r.assignedAmount), fontSize: 9, alignment: 'right' },
    {
      text: fmt(r.collectedAmount),
      fontSize: 9,
      alignment: 'right',
      color: '#2e7d32',
    },
    {
      text: rate(r.collectionRate),
      fontSize: 9,
      alignment: 'right',
      bold: true,
    },
  ]);

  return {
    content: [
      {
        text: 'REPORTE DE EFICIENCIA CONCENTRADA',
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
              filterRow(
                'RANGO DE FECHAS',
                `${fmtDate(data.startDate)} - ${fmtDate(data.endDate)}`,
              ),
              filterRow(
                'RANGO EFICIENCIA',
                `${data.initialPercentage}% - ${data.finalPercentage}%`,
              ),
              filterRow('TIPO', data.efficiencyType),
              ...(data.collectorNum
                ? [filterRow('COLECTOR', `No. ${data.collectorNum}`)]
                : []),
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
        margin: [0, 0, 0, 10],
      },
      divider(515),
      {
        layout: 'letterTable',
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              {
                text: 'NO.',
                bold: true,
                fontSize: 8,
                alignment: 'center',
                color: '#555555',
              },
              { text: 'COLECTOR', bold: true, fontSize: 8, color: '#555555' },
              { text: 'GRUPO', bold: true, fontSize: 8, color: '#555555' },
              {
                text: 'ASIGNADO',
                bold: true,
                fontSize: 8,
                alignment: 'right',
                color: '#555555',
              },
              {
                text: 'COBRADO',
                bold: true,
                fontSize: 8,
                alignment: 'right',
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
            ...rows,
          ],
        },
        margin: [0, 0, 0, 4],
      } as Content,
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
  };
};

// pdf.worker.ts
import { parentPort, workerData } from 'worker_threads';
import pdfmake from 'pdfmake';
import { join } from 'path';

// Configuración de fuentes (igual que antes)
pdfmake.addFonts({
  Roboto: {
    normal: join(
      process.cwd(),
      'node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf',
    ),
    bold: join(
      process.cwd(),
      'node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf',
    ),
  },
});

const tableLayouts = {
  noPadding: {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  },
  letterTable: {
    hLineWidth: (i, node) =>
      i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0,
    vLineWidth: () => 0,
    hLineColor: () => '#cccccc',
    paddingTop: () => 5,
    paddingBottom: () => 5,
    paddingLeft: () => 4,
    paddingRight: () => 4,
  },
};

async function generate() {
  try {
    const { docDefinition } = workerData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = (pdfmake.createPdf as any)(docDefinition, tableLayouts);

    // Obtenemos el stream
    const buffer = await pdfDoc.getBuffer();

    if (buffer.buffer instanceof ArrayBuffer) {
      parentPort.postMessage({ type: 'data', chunk: buffer }, [buffer.buffer]);
    } else {
      parentPort.postMessage({ type: 'data', chunk: buffer });
    }
    parentPort.postMessage({ type: 'end' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    parentPort.postMessage({ type: 'error', error: errorMessage });
  }
}

generate();

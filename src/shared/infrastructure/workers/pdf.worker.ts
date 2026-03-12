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

async function generate() {
  try {
    const { docDefinition } = workerData;
    const pdfDoc = pdfmake.createPdf(docDefinition);

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

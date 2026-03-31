import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { Readable } from 'stream';
import { join } from 'path';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { IPrinterService } from '@/shared/infrastructure/services/print.service';

@Injectable()
export class PDFService implements IPrinterService {
  async print(docDefinition: TDocumentDefinitions): Promise<Readable> {
    const resStream = new Readable({ read() {} });
    const worker = new Worker(
      join(__dirname, '../../infrastructure/workers/pdf.worker.js'),
      {
        workerData: { docDefinition },
      },
    );
    worker.on('message', (msg) => {
      if (msg.type === 'data') {
        resStream.push(msg.chunk);
      } else if (msg.type === 'end') {
        resStream.push(null); // Cierra el stream
      } else if (msg.type === 'error') {
        resStream.destroy(new Error(msg.error));
      }
    });
    worker.on('error', (err) => {
      resStream.destroy(err);
    });
    worker.on('exit', (code) => {
      if (code !== 0) {
        resStream.destroy(new Error(`Worker finalizó con código ${code}`));
      }
    });
    return resStream;
  }
}

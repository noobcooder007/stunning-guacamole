import { Logger } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const logger = new Logger('PipePdfStream');

// readable.pipe(res) no propaga errores del stream de origen: si el worker de
// pdfmake falla (ej. una imagen inválida), Node emite 'error' sin listeners y
// tumba todo el proceso. pipeline() sí propaga y limpia ambos streams.
export async function pipePdfStream(
  pdfStream: Readable,
  res: Response,
): Promise<void> {
  try {
    await pipeline(pdfStream, res);
  } catch (err) {
    logger.error(
      'Error al generar el PDF',
      err instanceof Error ? err.stack : String(err),
    );
    if (!res.headersSent) {
      res.status(500).json({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'No se pudo generar el PDF',
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
}

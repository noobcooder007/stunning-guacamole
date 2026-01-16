import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { transactionStorage } from '@/database/transactional-context'; // Importa tu storage del UOW

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // 1. Obtener o generar el Trace ID
    const traceId = req.headers['x-trace-id']?.toString() || uuidv4();

    // 2. Adjuntarlo a la respuesta para el cliente
    res.setHeader('x-trace-id', traceId);

    // 3. ENVOLVER TODO EN EL STORAGE
    // Importante: El manager empieza como undefined, el UOW lo llenará después
    transactionStorage.run({ traceId }, () => {
      this.logger.log(`[${traceId}] INCOMING ${method} ${originalUrl}`);

      res.on('finish', () => {
        const { statusCode } = res;
        const duration = Date.now() - startTime;
        const message = `[${traceId}] OUTGOING ${method} ${originalUrl} - Status: ${statusCode} - ${duration}ms`;

        // Clasificación de logs
        if (statusCode >= 500) {
          this.logger.error(message);
        } else if (statusCode >= 400) {
          this.logger.warn(message);
        } else {
          this.logger.log(message);
        }
      });

      // 4. Continuar con la cadena (Guards, Interceptors, Controllers...)
      next();
    });
  }
}

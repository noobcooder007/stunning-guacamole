import { Readable } from 'node:stream';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export abstract class IPrinterService {
  abstract print(data: TDocumentDefinitions): Promise<Readable>;
}

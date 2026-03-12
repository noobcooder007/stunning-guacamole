import { Readable } from 'node:stream';

export abstract class IPrinterService {
  abstract generateStream(data: any): Promise<Readable>;
}

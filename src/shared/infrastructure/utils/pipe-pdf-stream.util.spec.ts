import { Readable, Writable } from 'stream';
import { pipePdfStream } from './pipe-pdf-stream.util';

function makeRes(headersSent = false) {
  const chunks: Buffer[] = [];
  const res = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk);
      cb();
    },
  }) as Writable & {
    headersSent: boolean;
    status: jest.Mock;
    json: jest.Mock;
  };
  res.headersSent = headersSent;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return { res, chunks };
}

describe('pipePdfStream', () => {
  it('debería transmitir los datos del stream al response sin errores', async () => {
    const pdfStream = Readable.from([Buffer.from('%PDF-1.4')]);
    const { res, chunks } = makeRes();

    await pipePdfStream(pdfStream, res as any);

    expect(Buffer.concat(chunks).toString()).toBe('%PDF-1.4');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debería responder 500 si el stream falla antes de enviar headers', async () => {
    const pdfStream = new Readable({
      read() {
        this.destroy(new Error('Unknown image format'));
      },
    });
    const { res } = makeRes(false);

    await pipePdfStream(pdfStream, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'INTERNAL_SERVER_ERROR' }),
    );
  });

  it('no debería intentar responder si los headers ya se enviaron', async () => {
    const pdfStream = new Readable({
      read() {
        this.destroy(new Error('boom mid-stream'));
      },
    });
    const { res } = makeRes(true);
    const endSpy = jest.spyOn(res, 'end');

    await pipePdfStream(pdfStream, res as any);

    expect(res.status).not.toHaveBeenCalled();
    expect(endSpy).toHaveBeenCalled();
  });
});

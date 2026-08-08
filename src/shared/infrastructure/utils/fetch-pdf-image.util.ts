import { Logger } from '@nestjs/common';
import sharp from 'sharp';

const logger = new Logger('FetchPdfImage');

// pdfmake solo decodifica JPEG y PNG (no WEBP), pero las fotos de perfil se
// guardan en WEBP (image-processor.util.ts). Sin re-codificar, cualquier PDF
// que incluya una foto de colector falla con "Unknown image format" dentro
// del worker de pdfmake y tumba el proceso completo (ver pdf.service.ts).
export async function fetchPdfCompatibleImage(
  relativePath: string,
): Promise<string | null> {
  try {
    const host = process.env.APP_URL ?? 'http://localhost:4321';
    const response = await fetch(
      `${host}/public/profile-pictures/${relativePath}`,
    );
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const png = await sharp(buffer).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch (err) {
    logger.warn(
      `No se pudo preparar la imagen "${relativePath}" para el PDF: ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

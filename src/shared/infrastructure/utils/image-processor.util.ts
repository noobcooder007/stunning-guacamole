import sharp from 'sharp';

export async function processProfileImage(
  inputBuffer: Buffer,
  outputPath: string,
): Promise<void> {
  await sharp(inputBuffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(outputPath);
}

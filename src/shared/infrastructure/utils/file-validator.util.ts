import { BadRequestException } from '@nestjs/common';
import { unlink } from 'fs/promises';

export const validateImageFile = async (file: Express.Multer.File) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];

  const fileExtension = file.originalname
    .toLowerCase()
    .slice(((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2);

  // Validar tanto el MIME como la extensión
  if (
    !allowedMimes.includes(file.mimetype) ||
    !allowedExtensions.includes(`.${fileExtension}`)
  ) {
    if (file.path) await unlink(file.path); // Borrar si no es imagen
    throw new BadRequestException(
      'The file is not a valid image (jpg, jpeg, png)',
    );
  }
};

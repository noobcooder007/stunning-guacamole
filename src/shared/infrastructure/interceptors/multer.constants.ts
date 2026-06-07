import { memoryStorage } from 'multer';

export const profileMulterOptions = {
  storage: memoryStorage(),
};

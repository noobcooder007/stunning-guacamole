import { diskStorage } from 'multer';
import { extname } from 'path';

export const profileMulterOptions = {
  storage: diskStorage({
    destination: './images/profile-pictures',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname).toLowerCase()}`);
    },
  }),
};

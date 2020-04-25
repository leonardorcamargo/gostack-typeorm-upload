import path from 'path';
import multer from 'multer';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(req, file, callback) {
      const fileName = `${Date.now()}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};

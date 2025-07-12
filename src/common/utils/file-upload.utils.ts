import { extname } from 'path';

export const editFileName = (
  _req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const name = file.originalname.split('.')[0].replace(/\s/g, '');
  const fileExtName = extname(file.originalname);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const uniqueFileName = `${name}-${timestamp}-${random}${fileExtName}`;
  callback(null, uniqueFileName);
};

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new Error('Faqat rasm fayllari yuklanadi!'), false);
  }
  callback(null, true);
};

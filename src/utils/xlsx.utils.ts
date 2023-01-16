import { extname, join } from 'path';

export const xlsxFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(xlsx)$/)) {
    req.fileValidationError = 'Only XLSX files are allowed!';
    callback(null, false);
    // return callback(new Error('Only XLSX files are allowed!'), false);
  }
  callback(null, true);
};

export const xlsxFileName = (req, file, callback) => {
  //const name = file.originalname.split('.')[0];
  callback(null, file.originalname);
};

export const getXLSXFile = (fileName) => {
  //const name = file.originalname.split('.')[0];
  const filePath = join(__dirname, '..', '..', 'uploads/xlsx', fileName);
  return filePath;
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

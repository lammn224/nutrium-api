import { UploadTypesEnum } from '@/modules/files/upload-types.enum';
import { UnprocessableEntityException } from '@nestjs/common';
import * as path from 'path';

export class MulterUtils {
  static getConfig(fieldName, filesAllowed: UploadTypesEnum, maxSizeInMB = 20) {
    return {
      limits: {
        fileSize: Math.pow(1024, 2) * maxSizeInMB,
      },
      fileFilter: (req: any, file: any, cb: any) => {
        const a = path
          .extname(file.originalname)
          .toLowerCase()
          .replace('.', '');

        const regex = new RegExp(`${filesAllowed}`);
        if (
          regex.test(
            path.extname(file.originalname).toLowerCase().replace('.', ''),
          )
        ) {
          // Allow storage of file
          cb(null, true);
        } else {
          return cb(
            new UnprocessableEntityException({
              errors: {
                [fieldName]: [
                  `Invalid file type, one of ${filesAllowed} is allowed!`,
                ],
              },
            }),
            false,
          );
        }
      },
    };
  }
}

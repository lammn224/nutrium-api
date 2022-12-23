import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadTypesEnum } from '@/modules/files/upload-types.enum';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterUtils } from '@/modules/files/multer.utils';

export function ApiFile(
  fieldName = 'file',
  fileType: UploadTypesEnum = UploadTypesEnum.ANY,
  maxSizeInMB = 20,
  required = true,
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(
        fieldName,
        MulterUtils.getConfig(fieldName, fileType, maxSizeInMB),
      ),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

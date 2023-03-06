import {
  BadRequestException,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '@/modules/files/files.service';
import { ApiFile } from '@/decorators/upload-file.decorator';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { UploadTypesEnum } from '@/modules/files/upload-types.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { getXLSXFile, xlsxFileFilter, xlsxFileName } from '@/utils/xlsx.utils';
import * as fs from 'fs';
import { promisify } from 'util';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@/enums/role.enum';
import { FileExtender } from '@/modules/files/file-extender';

const unlinkAsync = promisify(fs.unlink);
@ApiBearerAuth()
@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Roles(Role.Admin)
  @AuthApiError()
  @ApiOperation({ summary: 'Upload excel file to create one or multi classes' })
  @ApiFile('file', UploadTypesEnum.DOCS)
  @UseInterceptors(FileExtender)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/xlsx',
        filename: xlsxFileName,
      }),
      fileFilter: xlsxFileFilter,
    }),
  )
  @Post('upload-excel')
  async uploadExcelFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    const filePath = getXLSXFile(file.originalname);

    const result = await this.filesService.readExcelFile(
      file.originalname,
      // @ts-ignore
      file.grade,
      filePath,
      req.user,
    );

    await unlinkAsync(filePath);
    return result;
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Upload image' })
  @ApiFile('file', UploadTypesEnum.IMAGES)
  @Post('upload-image')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.uploadFile(
      file.buffer,
      file.originalname,
    );

    return result;
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Upload audio' })
  @ApiFile('file', UploadTypesEnum.AUDIO)
  @Post('upload-audio')
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.uploadFile(
      file.buffer,
      file.originalname,
    );

    return result;
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Upload hash image' })
  @ApiFile('file', UploadTypesEnum.IMAGES)
  @Post('upload-hash-image')
  async uploadHashImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.processImageToHash(
      file.buffer,
      file.originalname,
    );
    return result;
  }

  @AuthApiError()
  @ApiOperation({ summary: 'Upload audio with metadata' })
  @ApiFile('file', UploadTypesEnum.AUDIO)
  @Post('upload-audio-with-metadata')
  async uploadAudioWithMetadata(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.uploadAudioWithMetadata(
      file,
      file.originalname,
    );
    return result;
  }
}

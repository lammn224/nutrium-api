import { Controller, Post, UploadedFile } from '@nestjs/common';
import { Express } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '@/modules/files/files.service';
import { ApiFile } from '@/decorators/upload-file.decorator';
import { AuthApiError } from '@/decorators/api-error-response.decorator';
import { UploadTypesEnum } from '@/modules/files/upload-types.enum';

@ApiBearerAuth()
@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

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

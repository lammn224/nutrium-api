import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';
import { encode } from 'blurhash';
import imageSizesConstants from '@/constants/image-sizes.constants';
import * as mm from 'music-metadata';
import { Readable } from 'stream';
import { Express } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const md5 = require('md5');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg');

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  async uploadFile(
    dataBuffer: Buffer,
    filename: string,
    changeName = true,
    folder = 'uploads',
  ) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_ENDPOINT,
      s3ForcePathStyle: true,
    });
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_BUCKET'),
        Body: dataBuffer,
        Key: `${folder}/${changeName ? uuid() + '-' : ''}${filename}`,
        ACL: 'public-read',
      })
      .promise();

    return uploadResult;
  }

  async processImageToHash(dataBuffer: Buffer, filename: string) {
    //todo get metadata of image (width, height)
    const image = await sharp(dataBuffer);
    const metadata = await image.metadata();
    const { width } = metadata;

    const splits = filename.split('.');
    const fileExt = splits[splits.length - 1];

    //todo resize raw image to get hash string
    const tinyImageData = await image.resize({ width: 50 }).toBuffer();

    const { data: pixels, info: blurMeta } = await sharp(tinyImageData)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
    const clamped = new Uint8ClampedArray(pixels);
    const hashStr = encode(clamped, blurMeta.width, blurMeta.height, 4, 4);
    //todo get list size available
    const availableSizes =
      width >= imageSizesConstants[0]
        ? imageSizesConstants.filter((item) => item <= width)
        : [imageSizesConstants[0]];
    const maxSize = availableSizes[availableSizes.length - 1];
    const rootFileName = hashStr + '-' + maxSize;
    const uploadProcess = [];
    uploadProcess.push(
      this.uploadHashImage(dataBuffer, rootFileName + '.' + fileExt),
    );

    //todo resize image to size with jpg
    uploadProcess.push(this.uploadHashImageSize(image, rootFileName, true));
    availableSizes.forEach((item) => {
      uploadProcess.push(
        this.uploadHashImageResize(image, item, rootFileName, true),
      );
    });
    //todo resize image to webp
    uploadProcess.push(this.uploadHashImageSize(image, rootFileName, false));
    availableSizes.forEach((item) => {
      uploadProcess.push(
        this.uploadHashImageResize(image, item, rootFileName, false),
      );
    });
    await Promise.all(uploadProcess);
    return {
      Location: rootFileName,
    };
  }

  async uploadHashImageSize(image, fileName, isJpg = true) {
    let buffer = null;
    if (isJpg) {
      buffer = await image.jpeg().toBuffer();
    } else {
      buffer = await image.webp().toBuffer();
    }

    return await this.uploadHashImage(
      buffer,
      fileName + (isJpg ? '.jpg' : '.webp'),
    );
  }

  async uploadHashImageResize(image, size, fileName, isJpg = true) {
    let buffer = null;
    if (isJpg) {
      buffer = await image.resize({ width: size }).jpeg().toBuffer();
    } else {
      buffer = await image.resize({ width: size }).webp().toBuffer();
    }

    return await this.uploadHashImage(
      buffer,
      fileName + '-' + size + (isJpg ? '.jpg' : '.webp'),
    );
  }

  async uploadHashImage(buffer, fileName) {
    return await this.uploadFile(buffer, fileName, false);
  }

  async uploadAudioWithMetadata(audioFile: Express.Multer.File, fileName) {
    const shortDetails = {
      type: audioFile.originalname.split('.').pop(),
      size: audioFile.size,
    };

    const hash = await md5(audioFile.buffer);
    const metadata = await mm.parseBuffer(audioFile.buffer);
    const storedType = shortDetails.type == 'm4a' ? 'm4a' : 'mp3';
    let uploadResult = null;

    if (shortDetails.type === 'mp3' || shortDetails.type == 'm4a') {
      uploadResult = await this.uploadFile(
        audioFile.buffer,
        `${hash}.${storedType}`,
      );
    } else {
      const readStream = new Readable();
      readStream.push(audioFile.buffer);
      readStream.push(null);

      const audioBuffer = await this.convertToMp3(readStream);
      uploadResult = await this.uploadFile(
        audioBuffer,
        `${hash}.${storedType}`,
      );
    }

    return {
      src: uploadResult.Location,
      duration: metadata.format.duration,
    };
  }

  async convertToMp3(audioStream): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      let writeStream = Buffer.alloc(0);

      ffmpeg()
        .input(audioStream)
        .toFormat('mp3')
        .on('error', (err) => {
          return reject(
            new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR),
          );
        })
        .pipe(writeStream, { end: true })
        .on('data', function (chunk) {
          writeStream = Buffer.concat([writeStream, chunk]);
        })
        .on('end', () => {
          resolve(writeStream);
        });
    });
  }
}

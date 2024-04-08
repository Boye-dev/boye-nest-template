import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class AwsService {
  constructor(private configService: ConfigService) {}

  async uploadMultipleFiles(files: Array<Express.Multer.File>) {
    const AWS_ACCESS_KEY_ID =
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const S3_REGION = this.configService.get<string>('S3_REGION');
    const S3_BUCKET = this.configService.get<string>('S3_BUCKET');
    const CLOUDFRONTURL = this.configService.get<string>('CLOUDFRONTURL');

    const s3 = new S3Client({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: S3_REGION,
    });

    const bucketName = S3_BUCKET;
    try {
      if (!files || files.length === 0) {
        console.log('No files were provided for upload.');
        return [];
      }

      const filePromises = files.map(async (file) => {
        const key = `${v4()}-${file.originalname}`;
        console.log(file.mimetype);
        const params = {
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(params);

        return s3
          .send(command)
          .then(() => {
            const url = CLOUDFRONTURL + key;
            return url;
          })
          .catch((error) => {
            console.error('Error uploading file:', error);
            throw error;
          });
      });
      const fileKeys = await Promise.all(filePromises);

      return fileKeys;
    } catch (error) {
      throw error;
    }
  }

  async uploadSingleFile(files: Express.Multer.File): Promise<string> {
    const AWS_ACCESS_KEY_ID =
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const S3_REGION = this.configService.get<string>('S3_REGION');
    const S3_BUCKET = this.configService.get<string>('S3_BUCKET');
    const CLOUDFRONTURL = this.configService.get<string>('CLOUDFRONTURL');

    const s3 = new S3Client({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: S3_REGION,
    });

    const bucketName = S3_BUCKET;
    try {
      const file = files;

      const key = `${v4()}-${file.originalname}`;

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const command = new PutObjectCommand(params);

      return s3
        .send(command)
        .then(() => {
          const url = CLOUDFRONTURL + key;
          return url;
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
          throw error;
        });
    } catch (error) {
      throw error;
    }
  }
}

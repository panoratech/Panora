import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { FileInfo } from '@@core/rag/types';
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ServiceRegistry } from '@filestorage/file/services/registry.service';
import { IFileService } from '@filestorage/file/types';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { BUCKET_NAME } from './constants';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import * as mammoth from 'mammoth';
import * as marked from 'marked';
import * as XLSX from 'xlsx';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private envService: EnvironmentService,
    private fileServiceRegistry: ServiceRegistry,
  ) {
    // const creds = this.envService.getAwsCredentials();
    const creds = this.envService.getMinioCredentials();
    this.s3 = new S3Client({
      endpoint: 'http://minio:9000',
      region: 'us-east-1',
      forcePathStyle: true,
      //region: creds.region,
      credentials: {
        accessKeyId: creds.accessKeyId || 'myaccesskey13',
        secretAccessKey: creds.secretAccessKey || 'mysecretkey12',
      },
    });
  }

  async ensureBucketExists(s3Client: S3Client, bucketName: string) {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      if (error.name === 'NotFound') {
        try {
          await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
          console.log(`Bucket ${bucketName} created successfully`);
        } catch (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError);
          throw createError;
        }
      } else {
        // Some other error occurred
        console.error(`Error checking bucket ${bucketName}:`, error);
        throw error;
      }
    }
  }

  async uploadFilesFromUrls(
    urlsWithKeys: FileInfo[],
    linkedUserId: string,
  ): Promise<void> {
    await this.ensureBucketExists(this.s3, BUCKET_NAME);
    const batchSize = 10;
    for (let i = 0; i < urlsWithKeys.length; i += batchSize) {
      const batch = urlsWithKeys.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ({ id, url, s3Key, provider }) => {
          try {
            const service: IFileService = this.fileServiceRegistry.getService(
              provider.toLowerCase().trim(),
            );
            if (!service) return;
            await this.streamFileToS3(
              service,
              id,
              linkedUserId,
              this.s3,
              s3Key,
              provider.toLowerCase().trim(),
            );
            console.log(`Successfully uploaded ${s3Key} from ${provider}`);
          } catch (error) {
            console.error(
              `Failed to upload file from ${url} to ${s3Key} (${provider}):`,
              error,
            );
            throw error;
          }
        }),
      );
    }
  }

  async streamFileToS3(
    service: IFileService,
    file_id: string,
    linkedUserId: string,
    s3Client: S3Client,
    s3Key: string,
    providerName: string,
  ) {
    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: providerName,
        vertical: 'filestorage',
      },
    });

    const file = await this.prisma.fs_files.findUnique({
      where: {
        id_fs_file: file_id,
      },
    });

    const fileUniqueIdentifier = file.remote_id;

    let processedContent: string | Buffer;
    const mimeType = file.mime_type;
    let contentType = 'text/plain'; // Default content type

    switch (mimeType) {
      case 'application/pdf':
        contentType = 'application/pdf';
        processedContent = await service.downloadFile(
          fileUniqueIdentifier,
          connection,
        );
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'text/csv':
        contentType = 'text/csv';
        processedContent = await service.downloadFile(
          fileUniqueIdentifier,
          connection,
        );
        break;
      case 'text/tab-separated-values':
        processedContent = await this.processSpreadsheet(
          service,
          connection,
          fileUniqueIdentifier,
          mimeType,
        );
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'text/plain':
      case 'text/markdown':
      case 'application/rtf':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'text/html':
      case 'message/rfc822':
      case 'application/vnd.ms-outlook':
        processedContent = await this.processTextContent(
          service,
          connection,
          fileUniqueIdentifier,
          mimeType,
        );
        break;
      case 'application/json':
        processedContent = await this.processJsonContent(
          service,
          connection,
          fileUniqueIdentifier,
        );
        break;
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: Readable.from(processedContent),
        ContentType: contentType,
        ContentDisposition: `attachment; filename="${file.name}"`,
      },
    });

    try {
      await upload.done();
      console.log(`Successfully uploaded ${s3Key} to ${BUCKET_NAME}`);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  private async processSpreadsheet(
    service: IFileService,
    connection: any,
    fileId: string,
    mimeType: string,
  ): Promise<string> {
    const fileContent = await service.downloadFile(fileId, connection);
    let result = '';

    if (mimeType === 'text/csv') {
      const content = fileContent.toString('utf-8');
      const lines = content.split('\n').filter((line) => line.trim() !== '');

      if (lines.length === 0) {
        return 'Empty CSV file';
      }

      // Detect separator
      const possibleSeparators = [',', ';', '\t', '|'];
      const firstLine = lines[0];
      const separator =
        possibleSeparators.find((sep) => firstLine.includes(sep)) || ',';

      // Extract headers and determine the number of columns
      const headerMatch = firstLine.match(/^(.*?):(.*)/);
      const headers = headerMatch
        ? headerMatch[2].split(separator).map((h) => h.trim())
        : firstLine.split(separator).map((h) => h.trim());
      const columnCount = headers.length;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dataMatch = line.match(/^(.*?):(.*)/);
        const values = dataMatch
          ? dataMatch[2].split(separator).map((v) => v.trim())
          : line.split(separator).map((v) => v.trim());

        if (values.length === columnCount) {
          for (let j = 0; j < columnCount; j++) {
            result += `${headers[j]}: ${values[j]}\n`;
          }
          result += '\n';
        }
      }
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        const headers = data[0] as string[];
        for (let i = 1; i < data.length; i++) {
          const row = data[i] as any[];
          for (let j = 0; j < row.length; j++) {
            result += `${headers[j]}: ${row[j]}\n`;
          }
          result += '\n';
        }
      });
    } else {
      throw new Error(`Unsupported spreadsheet type: ${mimeType}`);
    }

    return result;
  }
  private async processTextContent(
    service: IFileService,
    connection: any,
    fileId: string,
    mimeType: string,
  ): Promise<string> {
    const fileContent = await service.downloadFile(fileId, connection);
    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileContent });
      return result.value;
    } else if (mimeType === 'text/markdown') {
      return marked.parse(fileContent.toString());
    } else {
      // For other text-based formats, we'll assume they're already in plain text
      return fileContent.toString();
    }
  }
  private async processJsonContent(
    service: IFileService,
    drive: any,
    fileId: string,
  ): Promise<string> {
    const fileContent = await service.downloadFile(drive, fileId);
    const jsonContent = JSON.parse(fileContent.toString());

    function flattenObject(obj: any, prefix = ''): { [key: string]: any } {
      return Object.keys(obj).reduce(
        (acc: { [key: string]: any }, k: string) => {
          const pre = prefix.length ? prefix + '.' : '';
          if (
            typeof obj[k] === 'object' &&
            obj[k] !== null &&
            !Array.isArray(obj[k])
          ) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
          } else if (Array.isArray(obj[k])) {
            obj[k].forEach((item: any, index: number) => {
              if (typeof item === 'object' && item !== null) {
                Object.assign(acc, flattenObject(item, `${pre}${k}[${index}]`));
              } else {
                acc[`${pre}${k}[${index}]`] = item;
              }
            });
          } else {
            acc[pre + k] = obj[k];
          }
          return acc;
        },
        {},
      );
    }

    const flattened = flattenObject(jsonContent);
    return Object.entries(flattened)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  async getReadStream(s3Key: string): Promise<Readable> {
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const { Body } = await this.s3.send(command);
    return Body as Readable;
  }
}

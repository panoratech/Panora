import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BUCKET_NAME } from '@@core/s3/constants';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFileService } from '@filestorage/file/types';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as mammoth from 'mammoth';
import * as marked from 'marked';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import { ServiceRegistry } from '../registry.service';
import { GoogleDriveFileOutput } from './types';

@Injectable()
export class GoogleDriveService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.file.toUpperCase() + ':' + GoogleDriveService.name,
    );
    this.registry.registerService('googledrive', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<GoogleDriveFileOutput[]>> {
    try {
      const { linkedUserId, id_folder } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'googledrive',
          vertical: 'filestorage',
        },
      });

      if (!connection) return;

      const auth = new OAuth2Client();
      auth.setCredentials({
        access_token: this.cryptoService.decrypt(connection.access_token),
      });
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.list({
        q: 'trashed = false',
        fields:
          'files(id, name, mimeType, modifiedTime, size, parents, webViewLink)',
        pageSize: 1000, // Adjust as needed
      });

      const files: GoogleDriveFileOutput[] = response.data.files.map(
        (file) => ({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          modifiedTime: file.modifiedTime!,
          size: file.size!,
          parents: file.parents,
          webViewLink: file.webViewLink,
        }),
      );
      this.logger.log(`Synced googledrive files !`);

      return {
        data: files,
        message: 'Google Drive files retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  extractFileId(url: string): string | null {
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : null;
  }

  async streamFileToS3(
    file_id: string,
    linkedUserId: string,
    s3Client: S3Client,
    s3Key: string,
  ) {
    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: 'googledrive',
        vertical: 'filestorage',
      },
    });

    const file = await this.prisma.fs_files.findUnique({
      where: {
        id_fs_file: file_id,
      },
    });
    const auth = new OAuth2Client();
    auth.setCredentials({
      access_token: this.cryptoService.decrypt(connection.access_token),
    });
    const drive = google.drive({ version: 'v3', auth });

    const fileUniqueIdentifier = this.extractFileId(file.file_url);
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileUniqueIdentifier,
      fields: 'name,mimeType',
    });

    let processedContent: string | Buffer;
    const mimeType = fileMetadata.data.mimeType;
    let contentType = 'text/plain'; // Default content type

    switch (mimeType) {
      case 'application/pdf':
        contentType = 'application/pdf';
        processedContent = await this.downloadFile(drive, fileUniqueIdentifier);
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'text/csv':
        contentType = 'text/csv';
        processedContent = await this.downloadFile(drive, fileUniqueIdentifier);
        break;
      case 'text/tab-separated-values':
        processedContent = await this.processSpreadsheet(
          drive,
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
          drive,
          fileUniqueIdentifier,
          mimeType,
        );
        break;
      case 'application/json':
        processedContent = await this.processJsonContent(
          drive,
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
        ContentDisposition: `attachment; filename="${fileMetadata.data.name}"`,
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
  private async downloadFile(drive: any, fileId: string): Promise<Buffer> {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' },
    );
    return Buffer.from(response.data);
  }

  private async processSpreadsheet(
    drive: any,
    fileId: string,
    mimeType: string,
  ): Promise<string> {
    const fileContent = await this.downloadFile(drive, fileId);
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
    drive: any,
    fileId: string,
    mimeType: string,
  ): Promise<string> {
    const fileContent = await this.downloadFile(drive, fileId);
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
    drive: any,
    fileId: string,
  ): Promise<string> {
    const fileContent = await this.downloadFile(drive, fileId);
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
}

import { CrmObject, UnifiedCrm } from '@crm/@lib/@types';
import { HrisObject, UnifiedHris } from '@hris/@lib/@types';
import { AtsObject, UnifiedAts } from '@ats/@lib/@types';
import { AccountingObject, UnifiedAccounting } from '@accounting/@lib/@types';
import { TicketingObject, UnifiedTicketing } from '@ticketing/@lib/@types';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';
import {
  FileStorageObject,
  UnifiedFileStorage,
} from '@filestorage/@lib/@types';
import {
  MarketingAutomationObject,
  UnifiedMarketingAutomation,
} from '@marketingautomation/@lib/@types';

export type Unified =
  | UnifiedCrm
  | UnifiedTicketing
  | UnifiedFileStorage
  | UnifiedMarketingAutomation
  | UnifiedAts
  | UnifiedHris
  | UnifiedAccounting;

export type UnifyReturnType = Unified | Unified[];

export type TargetObject =
  | CrmObject
  | HrisObject
  | AtsObject
  | AccountingObject
  | FileStorageObject
  | MarketingAutomationObject
  | TicketingObject;

export type StandardObject = TargetObject;

//API RESPONSE
export class ApiResponse<T> {
  data: T;
  @ApiPropertyOptional()
  message?: string;
  @ApiPropertyOptional()
  error?: string;
  @ApiProperty({ type: Number })
  statusCode: number;
}

export const ApiCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );

export function getFileExtension(fileName: string): string | null {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return '.' + parts.pop()!.toLowerCase();
  }
  return null;
}

export const MIME_TYPES: { [key: string]: string } = {
  '.aac': 'audio/aac',
  '.abw': 'application/x-abiword',
  '.apng': 'image/apng',
  '.arc': 'application/x-freearc',
  '.avif': 'image/avif',
  '.avi': 'video/x-msvideo',
  '.azw': 'application/vnd.amazon.ebook',
  '.bin': 'application/octet-stream',
  '.bmp': 'image/bmp',
  '.bz': 'application/x-bzip',
  '.bz2': 'application/x-bzip2',
  '.cda': 'application/x-cdf',
  '.csh': 'application/x-csh',
  '.css': 'text/css',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.eot': 'application/vnd.ms-fontobject',
  '.epub': 'application/epub+zip',
  '.gz': 'application/gzip',
  '.gif': 'image/gif',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.ico': 'image/vnd.microsoft.icon',
  '.ics': 'text/calendar',
  '.jar': 'application/java-archive',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jsonld': 'application/ld+json',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.mjs': 'text/javascript',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.mpkg': 'application/vnd.apple.installer+xml',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.oga': 'audio/ogg',
  '.ogv': 'video/ogg',
  '.ogx': 'application/ogg',
  '.opus': 'audio/ogg',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.php': 'application/x-httpd-php',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.rar': 'application/vnd.rar',
  '.rtf': 'application/rtf',
  '.sh': 'application/x-sh',
  '.svg': 'image/svg+xml',
  '.tar': 'application/x-tar',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.ts': 'video/mp2t',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.vsd': 'application/vnd.visio',
  '.wav': 'audio/wav',
  '.weba': 'audio/webm',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xhtml': 'application/xhtml+xml',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xml': 'application/xml',
  '.xul': 'application/vnd.mozilla.xul+xml',
  '.zip': 'application/zip',
  '.3gp': 'video/3gpp',
  '.3g2': 'video/3gpp2',
  '.7z': 'application/x-7z-compressed',
};

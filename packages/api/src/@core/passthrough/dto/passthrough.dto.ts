import { ApiProperty } from '@nestjs/swagger';

enum Action {
  GET = 'GET',
  POST = 'POST',
}

export type MultipartData = {
  name: string;
  data: string;
  encoding: string; //BASE64
  file_name: string; //make sure to include extension
};

export type JsonData = Record<string, any>;

export class PassThroughRequestDto {
  @ApiProperty({ name: 'method', enum: Action })
  method: Action;

  @ApiProperty()
  path: string;

  @ApiProperty()
  data?: JsonData | MultipartData[];

  @ApiProperty()
  request_format?: 'JSON' | 'MULTIPART';

  @ApiProperty()
  overrideBaseUrl?: string;

  headers?: Record<string, any>;
}

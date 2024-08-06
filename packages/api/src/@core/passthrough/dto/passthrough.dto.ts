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

  @ApiProperty({ type: String, nullable: true })
  path: string;

  @ApiProperty()
  data?: JsonData | MultipartData[];

  @ApiProperty({
    oneOf: [
      { type: 'object', additionalProperties: true },
      { type: 'array', items: { type: 'object', additionalProperties: true } },
    ],
    nullable: true,
  })
  request_format?: 'JSON' | 'MULTIPART';

  @ApiProperty({ type: Object, additionalProperties: true, nullable: true })
  overrideBaseUrl?: string;

  headers?: Record<string, any>;
}

import { ApiProperty } from '@nestjs/swagger';

enum Action {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT',
}

export class PassThroughRequestDto {
  @ApiProperty({ name: 'method', enum: Action })
  method: Action;
  @ApiProperty({ type: String, nullable: true })
  path: string;
  @ApiProperty({
    oneOf: [
      { type: 'object', additionalProperties: true },
      { type: 'array', items: { type: 'object', additionalProperties: true } },
    ],
    nullable: true,
  })
  data?: Record<string, any> | Record<string, any>[];
  @ApiProperty({ type: Object, additionalProperties: true, nullable: true })
  headers?: Record<string, string>;
}

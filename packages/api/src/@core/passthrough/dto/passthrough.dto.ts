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
  @ApiProperty()
  path: string;
  @ApiProperty()
  data?: Record<string, any> | Record<string, any>[];
  @ApiProperty()
  headers?: Record<string, string>;
}

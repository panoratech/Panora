import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

// To provide a default limit
const DEFAULT_PAGE_SIZE = 50;

export class FetchObjectsQueryDto {
  @ApiProperty({
    name: 'remote_data',
    description: 'Set to true to include data from the original software.',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  remote_data: boolean;

  @ApiProperty({
    name: 'limit',
    required: false,
    description: 'Set to get the number of records.',
  })
  @IsOptional()
  @IsNumber()
  @Transform((p) => Number(p.value))
  limit: number = DEFAULT_PAGE_SIZE;

  @ApiProperty({
    name: 'cursor',
    required: false,
    description: 'Set to get the number of records after this cursor.',
  })
  @IsOptional()
  @Transform((p) => Buffer.from(p.value, 'base64').toString())
  @IsUUID()
  cursor: string;
}

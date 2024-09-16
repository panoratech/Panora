import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

// To provide a default limit
export const DEFAULT_PAGE_SIZE = 50;

export class QueryDto {
  @ApiProperty({
    type: Boolean,
    name: 'remote_data',
    example: true,
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
    type: Number,
    name: 'limit',
    example: 10,
    required: false,
    description: 'Set to get the number of records.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit: number = DEFAULT_PAGE_SIZE;

  @ApiProperty({
    type: String,
    example: '1b8b05bb-5273-4012-b520-8657b0b90874',
    name: 'cursor',
    required: false,
    description: 'Set to get the number of records after this cursor.',
  })
  @IsOptional()
  @Transform((p) => Buffer.from(p.value, 'base64').toString())
  @IsUUID()
  cursor: string;
}

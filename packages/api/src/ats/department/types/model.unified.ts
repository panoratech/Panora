import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class UnifiedAtsDepartmentInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Sales',
    nullable: true,
    description: 'The name of the department',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    additionalProperties: true,
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAtsDepartmentOutput extends UnifiedAtsDepartmentInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the department',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description:
      'The remote ID of the department in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { key1: 'value1', key2: 42, key3: true },
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the department in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2023-10-01T12:00:00Z',
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}

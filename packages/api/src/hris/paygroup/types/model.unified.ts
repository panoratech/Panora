import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UnifiedHrisPaygroupInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Monthly Salaried',
    nullable: true,
    description: 'The name of the pay group',
  })
  @IsString()
  @IsOptional()
  pay_group_name?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      custom_field_1: 'value1',
      custom_field_2: 'value2',
    },
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedHrisPaygroupOutput extends UnifiedHrisPaygroupInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the pay group record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'paygroup_1234',
    nullable: true,
    description:
      'The remote ID of the pay group in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description:
      'The remote data of the pay group in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the pay group was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the pay group record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the pay group record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the pay group was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}

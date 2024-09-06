import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export type AccountType = 'SAVINGS' | 'CHECKING';

export class UnifiedHrisBankinfoInput {
  @ApiPropertyOptional({
    type: String,
    example: 'CHECKING',
    // enum: ['SAVINGS', 'CHECKING'],
    nullable: true,
    description: 'The type of the bank account',
  })
  @IsString()
  @IsOptional()
  account_type?: AccountType | string;

  @ApiPropertyOptional({
    type: String,
    example: 'Bank of America',
    nullable: true,
    description: 'The name of the bank',
  })
  @IsString()
  @IsOptional()
  bank_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1234567890',
    nullable: true,
    description: 'The account number',
  })
  @IsString()
  @IsOptional()
  account_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: '021000021',
    nullable: true,
    description: 'The routing number of the bank',
  })
  @IsString()
  @IsOptional()
  routing_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated employee',
  })
  @IsUUID()
  @IsOptional()
  employee_id?: string;

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

export class UnifiedHrisBankinfoOutput extends UnifiedHrisBankinfoInput {
  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the bank info record',
  })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description:
      'The remote ID of the bank info in the context of the 3rd Party',
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
      'The remote data of the bank info in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the bank info was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at: Date;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the bank info record',
  })
  @IsDateString()
  created_at: Date;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the bank info record',
  })
  @IsDateString()
  modified_at: Date;

  @ApiProperty({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the bank info was deleted in the remote system',
  })
  @IsBoolean()
  remote_was_deleted: boolean;
}

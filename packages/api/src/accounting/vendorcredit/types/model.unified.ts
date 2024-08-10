import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export class UnifiedAccountingVendorcreditInput {
  @ApiPropertyOptional({
    type: String,
    example: 'VC-001',
    nullable: true,
    description: 'The number of the vendor credit',
  })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date of the transaction',
  })
  @IsDateString()
  @IsOptional()
  transaction_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the vendor associated with the credit',
  })
  @IsUUID()
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1000',
    nullable: true,
    description: 'The total amount of the vendor credit',
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    description: 'The currency of the vendor credit',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the vendor credit',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated company',
  })
  @IsUUID()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUID of tracking categories associated with the vendor credit',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated accounting period',
  })
  @IsUUID()
  @IsOptional()
  accounting_period?: string;
}

export class UnifiedAccountingVendorcreditOutput extends UnifiedAccountingVendorcreditInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the vendor credit record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'remote_id_1234',
    nullable: true,
    description: 'The remote ID of the vendor credit',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: false,
    description: 'The created date of the vendor credit',
  })
  @IsDateString()
  created_at: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: false,
    description: 'The last modified date of the vendor credit',
  })
  @IsDateString()
  modified_at: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the vendor credit was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: string;
}

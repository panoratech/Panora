import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export class UnifiedAccountingTransactionInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Sale',
    nullable: true,
    description: 'The type of the transaction',
  })
  @IsString()
  @IsOptional()
  transaction_type?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1001',
    nullable: true,
    description: 'The transaction number',
  })
  @IsNumber()
  @IsOptional()
  number?: number;

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
    example: '1000',
    nullable: true,
    description: 'The total amount of the transaction',
  })
  @IsString()
  @IsOptional()
  total_amount?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the transaction',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    description: 'The currency of the transaction',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUID of tracking categories associated with the transaction',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated account',
  })
  @IsUUID()
  @IsOptional()
  id_acc_account?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated contact',
  })
  @IsUUID()
  @IsOptional()
  id_acc_contact?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated company info',
  })
  @IsUUID()
  @IsOptional()
  id_acc_company_info?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated accounting period',
  })
  @IsUUID()
  @IsOptional()
  id_acc_accounting_period?: string;
}

export class UnifiedAccountingTransactionOutput extends UnifiedAccountingTransactionInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the transaction record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'remote_id_1234',
    nullable: false,
    description: 'The remote ID of the transaction',
  })
  @IsString()
  remote_id: string; // Required field

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: false,
    description: 'The created date of the transaction',
  })
  @IsDateString()
  created_at: string; // Required field

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: false,
    description: 'The last modified date of the transaction',
  })
  @IsDateString()
  modified_at: string; // Required field

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the transaction was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: string;
}

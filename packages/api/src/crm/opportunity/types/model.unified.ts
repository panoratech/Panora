import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';

export class UnifiedOpportunityInput {
  @ApiProperty({ type: String, description: 'The name of the opportunity' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: String, description: 'The description of the opportunity' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number, description: 'The value of the opportunity' })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ type: String, description: 'The UUID of the user tied to the opportunity' })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({ type: String, description: 'The UUID of the company tied to the opportunity' })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({ type: String, description: 'The UUID of the contact tied to the opportunity' })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

  @ApiPropertyOptional({ type: String, description: 'The UUID of the deal tied to the opportunity' })
  @IsUUID()
  @IsOptional()
  deal_id?: string;

  @ApiPropertyOptional({ type: {}, description: 'The custom field mappings of the opportunity between the remote 3rd party & Panora' })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedOpportunityOutput extends UnifiedOpportunityInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the opportunity' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ type: String, description: 'The id of the opportunity in the context of the Crm 3rd Party' })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({ type: {}, description: 'The remote data of the opportunity in the context of the Crm 3rd Party' })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({ type: {}, description: 'The created date of the object' })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({ type: {}, description: 'The modified date of the object' })
  @IsOptional()
  modified_at?: any;

  @ApiPropertyOptional({ type: String, description: 'The title of the opportunity' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ type: Number, description: 'The amount of the opportunity' })
  @IsNumber()
  @IsOptional()
  amount?: number;
}

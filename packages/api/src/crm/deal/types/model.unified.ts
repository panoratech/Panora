import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UnifiedDealInput {
  @ApiProperty({ type: String, description: 'The name of the deal' })
  @IsString()
  name: string;

  @ApiProperty({ type: String, description: 'The description of the deal' })
  @IsString()
  description: string;

  @ApiProperty({ type: Number, description: 'The amount of the deal' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the user who is on the deal',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the stage of the deal',
  })
  @IsString()
  @IsOptional()
  stage_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the company tied to the deal',
  })
  @IsString()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedDealOutput extends UnifiedDealInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the deal' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the deal in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the deal in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

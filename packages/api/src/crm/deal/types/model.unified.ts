import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedCrmDealInput {
  @ApiProperty({
    type: String,
    description: 'The name of the deal',
    nullable: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The description of the deal',
    nullable: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: Number,
    description: 'The amount of the deal',
    nullable: true,
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the user who is on the deal',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the stage of the deal',
  })
  @IsUUID()
  @IsOptional()
  stage_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the company tied to the deal',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmDealOutput extends UnifiedCrmDealInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the deal',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the deal in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the deal in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}

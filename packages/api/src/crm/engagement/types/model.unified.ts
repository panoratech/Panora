import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UnifiedEngagementInput {
  @ApiPropertyOptional({ type: String, description: 'The content of the engagement' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ 
    type: String,
    description: 'The direction of the engagement. Authorized values are INBOUND or OUTBOUND' 
  })
  @IsIn(['INBOUND', 'OUTBOUND'], {
    message: "Direction must be either INBOUND or OUTBOUND"
  })
  @IsOptional()
  direction?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The subject of the engagement' 
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'The start time of the engagement' })
  @IsOptional()
  start_at?: Date;

  @ApiPropertyOptional({ description: 'The end time of the engagement' })
  @IsOptional()
  end_time?: Date;

  @ApiProperty({
    type: String,
    description:
      'The type of the engagement. Authorized values are EMAIL, CALL or MEETING',
  })
  @IsIn(['EMAIL', 'CALL', 'MEETING'], {
    message: "Type must be either EMAIL, CALL or MEETING"
  })
  type: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the user tied to the engagement',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the company tied to the engagement',
  })
  @IsString()
  @IsOptional()
  company_id?: string; // uuid of Company object

  @ApiPropertyOptional({
    type: [String],
    description: 'The uuids of contacts tied to the engagement object',
  })
  @IsOptional()
  contacts?: string[]; // array of uuids of Engagement Contacts objects

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the engagement between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedEngagementOutput extends UnifiedEngagementInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the engagement' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the engagement in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the engagement in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

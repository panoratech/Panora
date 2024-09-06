import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type EngagementDirection = 'INBOUND' | 'OUTBOUND';
export type EngagementType = 'EMAIL' | 'CALL' | 'MEETING';

export class UnifiedCrmEngagementInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Meeting call with CTO',
    description: 'The content of the engagement',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'INBOUND',
    // enum: ['INBOUND', 'OUTBOUND'],
    description:
      'The direction of the engagement. Authorized values are INBOUND or OUTBOUND',
  })
  /*@IsIn(['INBOUND', 'OUTBOUND'], {
    message: 'Direction must be either INBOUND or OUTBOUND',
  })*/
  @IsOptional()
  direction?: EngagementDirection | string;

  @ApiPropertyOptional({
    type: String,
    example: 'Technical features planning',
    nullable: true,
    description: 'The subject of the engagement',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The start time of the engagement',
  })
  @IsOptional()
  start_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T22:00:00Z',
    description: 'The end time of the engagement',
  })
  @IsOptional()
  end_time?: Date;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'MEETING',
    // enum: ['EMAIL', 'CALL', 'MEETING'],
    description:
      'The type of the engagement. Authorized values are EMAIL, CALL or MEETING',
  })
  /*@IsIn(['EMAIL', 'CALL', 'MEETING'], {
    message: 'Type must be either EMAIL, CALL or MEETING',
  })*/
  type?: EngagementType | string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the user tied to the engagement',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the company tied to the engagement',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string; // UUID of Company object

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    description: 'The UUIDs of contacts tied to the engagement object',
  })
  @IsOptional()
  contacts?: string[]; // array of UUIDs of Engagement Contacts objects

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The custom field mappings of the engagement between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmEngagementOutput extends UnifiedCrmEngagementInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the engagement',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'id_1',
    description: 'The id of the engagement in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    additionalProperties: true,
    nullable: true,
    description:
      'The remote data of the engagement in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type EngagementDirection = 'INBOUND' | 'OUTBOUND';
export type EngagementType = 'EMAIL' | 'CALL' | 'MEETING';

export class UnifiedCrmEngagementInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Professional Call',
    description: 'The title of the engagement',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Call with a customer',
    description: 'The description of the engagement',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description: 'The custom field mappings of the engagement',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmEngagementOutput extends UnifiedCrmEngagementInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the engagement',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description:
      'The remote ID of the engagement in the context of the 3rd Party',
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
    description:
      'The remote data of the engagement in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}

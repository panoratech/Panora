import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type TaskStatus = 'PENDING' | 'COMPLETED';
export class UnifiedCrmTaskInput {
  @ApiProperty({
    type: String,
    example: 'Answer customers',
    description: 'The subject of the task',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    example: 'Prepare email campaign',
    description: 'The content of the task',
  })
  @IsString()
  content: string;

  @ApiProperty({
    type: String,
    example: 'PENDING',
    enum: ['PENDING', 'COMPLETED'],
    description:
      'The status of the task. Authorized values are PENDING, COMPLETED.',
  })
  @IsIn(['PENDING', 'COMPLETED'], {
    message: 'Type must be either PENDING or COMPLETED',
  })
  status: TaskStatus | string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The due date of the task',
  })
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The finished date of the task',
  })
  @IsOptional()
  finished_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the user tied to the task',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the company tied to the task',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the deal tied to the task',
  })
  @IsString()
  @IsOptional()
  deal_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The custom field mappings of the task between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmTaskOutput extends UnifiedCrmTaskInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the task',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The ID of the task in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { key1: 'value1', key2: 42, key3: true },
    description:
      'The remote data of the task in the context of the Crm 3rd Party',
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

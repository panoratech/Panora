import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type TaskStatus = 'PENDING' | 'COMPLETED' | string;
export class UnifiedCrmTaskInput {
  @ApiProperty({
    type: String,
    example: 'Answer customers',
    description: 'The subject of the task',
    nullable: true,
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    example: 'Prepare email campaign',
    description: 'The content of the task',
    nullable: true,
  })
  @IsString()
  content: string;

  @ApiProperty({
    type: String,
    example: 'PENDING',
    // enum: ['PENDING', 'COMPLETED'],
    description:
      'The status of the task. Authorized values are PENDING, COMPLETED.',
    nullable: true,
  })
  /*@IsIn(['PENDING', 'COMPLETED'], {
    message: 'Type must be either PENDING or COMPLETED',
  })*/
  status: TaskStatus | string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The due date of the task',
    nullable: true,
  })
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The finished date of the task',
    nullable: true,
  })
  @IsOptional()
  finished_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the user tied to the task',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the company tied to the task',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the deal tied to the task',
    nullable: true,
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
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmTaskOutput extends UnifiedCrmTaskInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the task',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The ID of the task in the context of the Crm 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { key1: 'value1', key2: 42, key3: true },
    description:
      'The remote data of the task in the context of the Crm 3rd Party',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description: 'The created date of the object',
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description: 'The modified date of the object',
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;
}

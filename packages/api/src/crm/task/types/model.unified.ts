import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type TaskStatus = 'PENDING' | 'COMPLETED';
export class UnifiedTaskInput {
  @ApiProperty({ type: String, description: 'The subject of the task' })
  @IsString()
  subject: string;

  @ApiProperty({ type: String, description: 'The content of the task' })
  @IsString()
  content: string;

  @ApiProperty({
    type: String,
    description:
      'The status of the task. Authorized values are PENDING, COMPLETED.',
  })
  @IsIn(['PENDING', 'COMPLETED'], {
    message: 'Type must be either PENDING or COMPLETED',
  })
  status: TaskStatus | string;

  @ApiPropertyOptional({ description: 'The due date of the task' })
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({ description: 'The finished date of the task' })
  @IsOptional()
  finished_date?: Date;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the user tied to the task',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID fo the company tied to the task',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the deal tied to the task',
  })
  @IsString()
  @IsOptional()
  deal_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the task between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedTaskOutput extends UnifiedTaskInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the task' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,

    description: 'The id of the task in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the task in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}

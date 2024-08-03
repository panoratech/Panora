import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type TaskStatus = 'PENDING' | 'COMPLETED';
export class UnifiedCrmTaskInput {
  @ApiProperty({
    type: String,
    description: 'The subject of the task',
    nullable: true,
  })
  @IsString()
  subject: string;

  @ApiProperty({
    type: String,
    description: 'The content of the task',
    nullable: true,
  })
  @IsString()
  content: string;

  @ApiProperty({
    type: String,
    description:
      'The status of the task. Authorized values are PENDING, COMPLETED.',
    nullable: true,
  })
  @IsIn(['PENDING', 'COMPLETED'], {
    message: 'Type must be either PENDING or COMPLETED',
  })
  status: TaskStatus | string;

  @ApiPropertyOptional({
    description: 'The due date of the task',
    nullable: true,
  })
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({
    description: 'The finished date of the task',
    nullable: true,
  })
  @IsOptional()
  finished_date?: Date;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the user tied to the task',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the company tied to the task',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the deal tied to the task',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  deal_id?: string;

  @ApiPropertyOptional({
    type: Object,
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
    description: 'The UUID of the task',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the task in the context of the Crm 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The remote data of the task in the context of the Crm 3rd Party',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Object,
    description: 'The created date of the object',
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    description: 'The modified date of the object',
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;
}

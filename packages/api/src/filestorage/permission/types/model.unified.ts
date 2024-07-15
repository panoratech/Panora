import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsIn } from 'class-validator';

export type PermissionType = 'USER' | 'GROUP' | 'COMPANY' | 'ANYONE';
export type PermissionRole = 'READ' | 'WRITE' | 'OWNER';

export class UnifiedPermissionInput {
  @ApiProperty({ type: [String], description: 'The roles of the permission' })
  @IsString()
  roles: (PermissionRole | string)[];

  @ApiProperty({ type: String, description: 'The type of the permission' })
  @IsIn(['USER', 'GROUP', 'COMPANY', 'ANYONE'])
  @IsString()
  type: PermissionType | string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the user tied to the permission',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the group tied to the permission',
  })
  @IsString()
  group_id: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedPermissionOutput extends UnifiedPermissionInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the permission',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the permission in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the permission in the context of the 3rd Party',
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

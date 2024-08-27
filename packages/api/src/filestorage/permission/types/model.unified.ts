import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsIn } from 'class-validator';

export type PermissionType = 'USER' | 'GROUP' | 'COMPANY' | 'ANYONE';
export type PermissionRole = 'READ' | 'WRITE' | 'OWNER';

export class UnifiedFilestoragePermissionInput {
  @ApiProperty({
    type: [String],
    example: ['READ'],
    // enum: ['READ', 'WRITE', 'OWNER'],
    nullable: true,
    description: 'The roles of the permission',
  })
  @IsString()
  roles: (PermissionRole | string)[];

  @ApiProperty({
    type: String,
    // enum: ['USER', 'GROUP', 'COMPANY', 'ANYONE'],
    example: 'USER',
    nullable: true,
    description: 'The type of the permission',
  })
  //@IsIn(['USER', 'GROUP', 'COMPANY', 'ANYONE'])
  @IsString()
  type: PermissionType | string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the user tied to the permission',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the group tied to the permission',
  })
  @IsString()
  group_id: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    additionalProperties: true,
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFilestoragePermissionOutput extends UnifiedFilestoragePermissionInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the permission',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The id of the permission in the context of the 3rd Party',
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
      'The remote data of the permission in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}

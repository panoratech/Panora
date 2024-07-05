import { UnifiedUserOutput } from '@filestorage/user/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedGroupInput {
  @ApiProperty({ type: String, description: 'The name of the group' })
  @IsString()
  name: string;

  @ApiProperty({ type: [String], description: 'Uuids of users of the group' })
  @IsString()
  users: (string | UnifiedUserOutput)[];

  @ApiProperty({
    type: Boolean,
    description:
      'Indicates whether or not this object has been deleted in the third party platform.',
  })
  @IsString()
  remote_was_deleted: boolean;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedGroupOutput extends UnifiedGroupInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the group',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the group in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the group in the context of the 3rd Party',
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

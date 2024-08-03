import { UnifiedUserOutput } from '@filestorage/user/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageGroupInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the group',
  })
  @IsString()
  name: string;

  @ApiProperty({ type: [String], description: 'Uuids of users of the group' })
  @IsString()
  users: (string | UnifiedUserOutput)[];

  @ApiProperty({
    type: Boolean,
    nullable: true,
    description:
      'Indicates whether or not this object has been deleted in the third party platform.',
  })
  @IsString()
  remote_was_deleted: boolean;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFilestorageGroupOutput extends UnifiedFilestorageGroupInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the group',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the group in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the group in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}

import { UnifiedFilestorageUserOutput } from '@filestorage/user/types/model.unified';
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageGroupInput {
  @ApiProperty({
    type: String,
    example: 'My group',
    nullable: true,
    description: 'The name of the group',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { type: 'string' },
        { $ref: getSchemaPath(UnifiedFilestorageUserOutput) },
      ],
    },
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    description: 'Uuids of users of the group',
  })
  @IsString()
  users: (string | UnifiedFilestorageUserOutput)[];

  @ApiProperty({
    type: Boolean,
    example: false,
    nullable: true,
    description:
      'Indicates whether or not this object has been deleted in the third party platform.',
  })
  @IsString()
  remote_was_deleted: boolean;

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

export class UnifiedFilestorageGroupOutput extends UnifiedFilestorageGroupInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the group',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The id of the group in the context of the 3rd Party',
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
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the group in the context of the 3rd Party',
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

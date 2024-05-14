import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedCollectionInput {
  @ApiProperty({
    type: String,
    description: 'The name of the collection',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The description of the collection',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The type of the collection. Authorized values are either PROJECT or LIST ',
  })
  @IsIn(['PROJECT', 'LIST'], {
    message: 'Type must be either PROJECT or LIST',
  })
  @IsOptional()
  collection_type?: string;

  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCollectionOutput extends UnifiedCollectionInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the collection',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the collection in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the collection in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type CollectionType = 'PROJECT' | 'LIST';

export class UnifiedTicketingCollectionInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the collection',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The description of the collection',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'The type of the collection. Authorized values are either PROJECT or LIST ',
  })
  @IsIn(['PROJECT', 'LIST'], {
    message: 'Type must be either PROJECT or LIST',
  })
  @IsOptional()
  collection_type?: CollectionType | string;
}

export class UnifiedTicketingCollectionOutput extends UnifiedTicketingCollectionInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the collection',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the collection in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the collection in the context of the 3rd Party',
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

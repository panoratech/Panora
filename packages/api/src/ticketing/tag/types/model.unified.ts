import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedTicketingTagInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the tag',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    description:
      'The custom field mappings of the tag between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedTicketingTagOutput extends UnifiedTicketingTagInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the tag',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the tag in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the tag in the context of the 3rd Party',
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

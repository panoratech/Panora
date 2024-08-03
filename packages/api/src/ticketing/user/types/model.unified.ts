import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedTicketingUserInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The email address of the user',
  })
  @IsString()
  email_address: string;

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    description: 'The teams whose the user is part of',
  })
  @IsOptional()
  teams?: string[];

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The account or organization the user is part of',
  })
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @ApiProperty({
    type: Object,
    nullable: true,
    description:
      'The custom field mappings of the user between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedTicketingUserOutput extends UnifiedTicketingUserInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the user',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the user in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the user in the context of the 3rd Party',
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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedTicketingUserInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsString()
  email_address: string;

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    description: 'The teams whose the user is part of',
    example: ['team1', 'team2'],
  })
  @IsOptional()
  teams?: string[];

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The account or organization the user is part of',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
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
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the user',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The id of the user in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { key1: 'value1', key2: 42, key3: true },
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the user in the context of the 3rd Party',
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
    type: Date,
    example: '2023-10-01T12:00:00Z',
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}

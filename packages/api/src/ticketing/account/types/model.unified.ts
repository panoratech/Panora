import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedTicketingAccountInput {
  @ApiProperty({
    type: String,
    example: 'My Personal Account',
    nullable: true,
    description: 'The name of the account',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['acme.com', 'acme-test.com'],
    nullable: true,
    description: 'The domains of the account',
  })
  @IsOptional()
  domains?: string[];

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    nullable: true,
    description:
      'The custom field mappings of the account between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedTicketingAccountOutput extends UnifiedTicketingAccountInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the account',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the account in the context of the 3rd Party',
    nullable: true,
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
    description:
      'The remote data of the account in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the account',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the account',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;
}

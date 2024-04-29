import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UnifiedAccountInput {
  @ApiProperty({ type: String, description: 'The name of the account' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The domains of the account',
  })
  @IsOptional()
  domains?: string[];

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the account between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAccountOutput extends UnifiedAccountInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the account' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the account in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the account in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

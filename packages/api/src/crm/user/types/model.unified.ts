import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UnifiedUserInput {
  @ApiProperty({ type: String, description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ type: String, description: 'The email of the user' })
  @IsString()
  email: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the user between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedUserOutput extends UnifiedUserInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the user' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the user in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the user in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedUserInput {
  @ApiProperty({ type: String, description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The email of the user',
  })
  @IsString()
  email: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the user is the one who linked this account.',
  })
  @IsString()
  is_me: boolean;
}

export class UnifiedUserOutput extends UnifiedUserInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the user',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the user in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the user in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

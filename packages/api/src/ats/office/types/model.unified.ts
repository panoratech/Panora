import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class UnifiedOfficeInput {
  @ApiPropertyOptional({ type: String, description: 'The name of the office' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The location of the office',
  })
  @IsString()
  @IsOptional()
  location?: string;
}

export class UnifiedOfficeOutput extends UnifiedOfficeInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the office' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the office in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the office in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

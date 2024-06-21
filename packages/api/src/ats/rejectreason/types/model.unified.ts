import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedRejectReasonInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The name of the reject reason',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class UnifiedRejectReasonOutput extends UnifiedRejectReasonInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the reject reason',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the reject reason in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the reject reason in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

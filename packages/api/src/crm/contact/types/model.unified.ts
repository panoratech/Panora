import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Email, Phone } from '.';

export class UnifiedContactInput {
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty({ type: [Email] })
  email_addresses: Email[];
  @ApiProperty({ type: [Phone] })
  phone_numbers: Phone[];
  @ApiPropertyOptional({ type: [{}] })
  field_mappings?: Record<string, any>[];
}

export class UnifiedContactOutput extends UnifiedContactInput {
  @ApiPropertyOptional()
  id?: string;
}

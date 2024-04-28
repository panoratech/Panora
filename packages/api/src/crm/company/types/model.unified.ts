import { Address, Email, Phone } from '@crm/@utils/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedCompanyInput {
  @ApiProperty({ description: 'The name of the company' })
  name: string;

  @ApiPropertyOptional({ description: 'The industry of the company' })
  industry?: string;

  @ApiPropertyOptional({
    description: 'The number of employees of the company',
  })
  number_of_employees?: number;

  @ApiPropertyOptional({
    description: 'The uuid of the user who owns the company',
  })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'The email addresses of the company',
    type: [Email],
  })
  email_addresses?: Email[];

  @ApiPropertyOptional({
    description: 'The addresses of the company',
    type: [Address],
  })
  addresses?: Address[];

  @ApiPropertyOptional({
    description: 'The phone numbers of the company',
    type: [Phone],
  })
  phone_numbers?: Phone[];

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedCompanyOutput extends UnifiedCompanyInput {
  @ApiPropertyOptional({ description: 'The uuid of the company' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the company in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the company in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}

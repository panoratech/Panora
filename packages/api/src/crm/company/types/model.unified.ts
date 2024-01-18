import { Address, Email, Phone } from '@crm/@utils/@types';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedCompanyInput {
  name: string;
  industry: string;
  number_of_employees: number;
  user_id?: string;
  email_addresses?: Email[];
  addresses?: Address[];
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

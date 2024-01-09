import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedDealInput {
  name: string;
  description: string;
  amount: number;
  user_id?: string;
  stage_id?: string;
  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedDealOutput extends UnifiedDealInput {
  @ApiPropertyOptional({ description: 'The uuid of the deal' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the deal in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the deal in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}

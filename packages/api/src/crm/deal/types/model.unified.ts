import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedDealInput {
  @ApiProperty({ description: 'The name of the deal' })
  name: string;

  @ApiProperty({ description: 'The description of the deal' })
  description: string;

  @ApiProperty({ description: 'The amount of the deal' })
  amount: number;

  @ApiPropertyOptional({
    description: 'The uuid of the user who is on the deal',
  })
  user_id?: string;

  @ApiPropertyOptional({ description: 'The uuid of the stage of the deal' })
  stage_id?: string;

  @ApiPropertyOptional({
    description: 'The uuid of the company tied to the deal',
  })
  company_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
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

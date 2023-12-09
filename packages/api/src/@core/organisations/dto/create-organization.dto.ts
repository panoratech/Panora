import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  stripe_customer_id: string;
}

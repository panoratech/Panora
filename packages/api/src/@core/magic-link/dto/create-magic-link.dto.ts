import { ApiProperty } from '@nestjs/swagger';

export class CreateMagicLinkDto {
  @ApiProperty()
  linked_user_origin_id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  alias: string;
  @ApiProperty()
  id_project: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkedUserDto {
  @ApiProperty()
  linked_user_origin_id: string;
  @ApiProperty()
  alias: string;
  @ApiProperty()
  id_project: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkedUserDto {
  @ApiProperty()
  linked_user_origin_id: string;
  @ApiProperty()
  alias: string;
}

export class CreateBatchLinkedUserDto {
  @ApiProperty()
  linked_user_origin_ids: string[];
  @ApiProperty()
  alias: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkedUserDto {
  @ApiProperty({ type: String, nullable: true })
  linked_user_origin_id: string;
  @ApiProperty({ type: String, nullable: true })
  alias: string;
}

export class CreateBatchLinkedUserDto {
  @ApiProperty({ type: [String], nullable: true })
  linked_user_origin_ids: string[];
  @ApiProperty({ type: String, nullable: true })
  alias: string;
}

export class LinkedUserResponse {
  @ApiProperty({ type: String, nullable: true })
  id_linked_user: string;

  @ApiProperty({ type: String, nullable: true })
  linked_user_origin_id: string;

  @ApiProperty({ type: String, nullable: true })
  alias: string;

  @ApiProperty({ type: String, nullable: true })
  id_project: string;
}

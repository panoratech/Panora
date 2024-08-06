import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkedUserDto {
  @ApiProperty({
    type: String,
    description: 'The id of the user in the context of your own software',
    example: 'id_1',
  })
  linked_user_origin_id: string;
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Your company alias',
    example: 'acme',
  })
  alias: string;
}

export class CreateBatchLinkedUserDto {
  @ApiProperty({
    type: [String],
    nullable: true,
    description: 'The ids of the users in the context of your own software',
    example: ['id_1'],
  })
  linked_user_origin_ids: string[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Your company alias',
    example: 'acme',
  })
  alias: string;
}

export class LinkedUserResponse {
  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
  })
  id_linked_user: string;

  @ApiProperty({ type: String, example: 'id_1', nullable: true })
  linked_user_origin_id: string;

  @ApiProperty({ type: String, example: 'acme', nullable: true })
  alias: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
  })
  id_project: string;
}

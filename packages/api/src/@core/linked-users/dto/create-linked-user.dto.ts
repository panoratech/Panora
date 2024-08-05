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
    description: 'Your company alias',
    example: 'acme',
  })
  alias: string;
}

export class CreateBatchLinkedUserDto {
  @ApiProperty({
    type: [String],
    description: 'The ids of the users in the context of your own software',
    example: ['id_1'],
  })
  linked_user_origin_ids: string[];
  @ApiProperty({
    type: String,
    description: 'Your company alias',
    example: 'acme',
  })
  alias: string;
}

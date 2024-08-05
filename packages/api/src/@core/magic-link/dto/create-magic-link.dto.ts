import { ApiProperty } from '@nestjs/swagger';

export class CreateMagicLinkDto {
  @ApiProperty({
    example: 'id_1',
    description: 'The linked user origin ID',
  })
  linked_user_origin_id: string;

  @ApiProperty({
    example: 'email@example.com',
    description: 'The email address',
  })
  email: string;

  @ApiProperty({
    example: '',
    description: 'The alias for the magic link',
  })
  alias: string;

  @ApiProperty({
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The project ID',
  })
  id_project: string;
}

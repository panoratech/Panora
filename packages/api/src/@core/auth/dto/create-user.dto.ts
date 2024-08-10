import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    type: String,
    description: 'The first name of the user',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    type: String,
    description: 'The last name of the user',
  })
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'oauth2',
    type: String,
    description: 'The authentication strategy',
  })
  strategy: string;

  @ApiPropertyOptional({
    example: '$hashed_163_password',
    type: String,
    description: 'The hashed password',
  })
  password_hash: string;

  @ApiPropertyOptional({
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    type: String,
    required: false,
    description: 'The organization ID',
  })
  id_organisation?: string;
}

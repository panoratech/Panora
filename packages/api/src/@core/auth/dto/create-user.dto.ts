import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password_hash: string;
}

export class LoginCredentials {
  id_user?: string;
  email?: string;
  password_hash: string;
}

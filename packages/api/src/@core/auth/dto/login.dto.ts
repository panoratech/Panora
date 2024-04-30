import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  id_user?: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password_hash: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  stytch_id_user: string;
  @ApiProperty()
  strategy: string;
  @ApiPropertyOptional()
  password_hash: string;
  @ApiPropertyOptional()
  id_organisation?: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  id_organization?: string;
  @ApiProperty()
  id_user: string;
}

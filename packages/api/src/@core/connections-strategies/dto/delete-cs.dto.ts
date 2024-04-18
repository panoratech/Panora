import { ApiProperty } from '@nestjs/swagger';

export class DeleteCSDto {
  @ApiProperty()
  id: string;
}

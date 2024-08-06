import { ApiProperty } from '@nestjs/swagger';

export class DeleteCSDto {
  @ApiProperty({ type: String })
  id: string;
}

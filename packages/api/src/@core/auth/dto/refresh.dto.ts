import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty()
  projectId: string;
}

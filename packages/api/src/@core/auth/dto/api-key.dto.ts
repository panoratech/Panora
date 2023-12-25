import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyDto {
  @ApiProperty()
  projectId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  keyName: string;
}

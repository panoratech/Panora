import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiKeyDto {
  @ApiProperty()
  projectId: string;
  @ApiProperty()
  userId: string;
  @ApiPropertyOptional()
  keyName?: string;
}

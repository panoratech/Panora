import { ApiProperty } from '@nestjs/swagger';

export class GetConnectionStrategyDto {
  @ApiProperty()
  projectId: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  attributes: string[];
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateConnectionStrategyDto {
  @ApiProperty()
  projectId: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  attributes: string[];
  @ApiProperty()
  values: string[];
}

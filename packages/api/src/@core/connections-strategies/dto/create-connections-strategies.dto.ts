import { ApiProperty } from '@nestjs/swagger';

export class CreateConnectionStrategyDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  attributes: string[];
  @ApiProperty()
  values: string[];
}

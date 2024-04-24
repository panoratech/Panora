import { ApiProperty } from '@nestjs/swagger';

export class ToggleStrategyDto {
  @ApiProperty()
  id_cs: string;
}

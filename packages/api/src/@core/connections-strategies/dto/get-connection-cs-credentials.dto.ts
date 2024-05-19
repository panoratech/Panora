import { ApiProperty } from '@nestjs/swagger';

export class ConnectionStrategyCredentials {
  @ApiProperty()
  type: string;
  @ApiProperty()
  attributes: string[];
}

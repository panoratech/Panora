import { ApiProperty } from '@nestjs/swagger';

export class PassThroughResponse {
  @ApiProperty()
  url: string;
  @ApiProperty()
  status: number;
  @ApiProperty()
  data: any;
  // Define the properties here
}

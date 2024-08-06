import { ApiProperty } from '@nestjs/swagger';

export class PassThroughResponse {
  @ApiProperty({ type: String, nullable: true })
  url: string;
  @ApiProperty({ type: Number, nullable: true })
  status: number;
  @ApiProperty({ type: Object, nullable: true })
  data: any;
  // Define the properties here
}

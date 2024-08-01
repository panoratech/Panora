import { ApiProperty } from '@nestjs/swagger';

export class UpdateCSDto {
  @ApiProperty({ type: String, nullable: true })
  id_cs: string;
  @ApiProperty({ type: Boolean, nullable: true })
  status: boolean;
  @ApiProperty({ type: [String], nullable: true })
  attributes: string[];
  @ApiProperty({ type: [String], nullable: true })
  values: string[];
}

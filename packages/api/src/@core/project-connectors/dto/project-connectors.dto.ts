import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class ProjectConnectorsDto {
  @ApiProperty()
  @IsString()
  column: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;
}

import { ApiProperty } from '@nestjs/swagger';

export class UpdateCSDto {
    @ApiProperty()
    id_cs: string;
    @ApiProperty()
    status: boolean;
    @ApiProperty()
    attributes: string[];
    @ApiProperty()
    values: string[];
}

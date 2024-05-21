import { ApiProperty } from '@nestjs/swagger';

export class CreateCatalogOptionsDto {
    @ApiProperty()
    id_user: string;
    @ApiProperty()
    selected_catalog: string;
}

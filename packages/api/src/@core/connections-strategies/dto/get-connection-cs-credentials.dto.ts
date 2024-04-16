import { ApiProperty } from '@nestjs/swagger';

export class ConnectionStrategyCredentials {
    @ApiProperty()
    projectId: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    attributes: string[];
}

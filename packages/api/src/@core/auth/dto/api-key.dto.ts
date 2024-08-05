import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyDto {
  @ApiProperty({
    name: 'projectId',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    required: true,
    type: String,
    description: 'Id of the project',
  })
  projectId: string;

  @ApiProperty({
    name: 'userId',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    required: true,
    type: String,
    description: 'Id of the user',
  })
  userId: string;

  @ApiProperty({
    name: 'keyName',
    example: 'My Api Key',
    required: true,
    type: String,
    description: 'Name of the key',
  })
  keyName: string;
}

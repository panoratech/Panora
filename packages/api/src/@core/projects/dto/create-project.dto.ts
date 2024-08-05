import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project Name',
    description: 'The name of the project',
  })
  name: string;

  @ApiPropertyOptional({
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The organization ID',
  })
  id_organization?: string;

  @ApiProperty({
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The user ID',
  })
  id_user: string;
}

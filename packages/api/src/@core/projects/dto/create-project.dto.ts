import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    type: String,
    example: 'Project Name',
    description: 'The name of the project',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The organization ID',
  })
  id_organization?: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The user ID',
  })
  id_user: string;
}

export class ProjectResponse {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the project',
  })
  id_project: string;

  @ApiProperty({
    type: String,
    example: 'My Project',
    description: 'Name of the project',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'automatic',
    description: 'Synchronization mode of the project',
  })
  sync_mode: string;

  @ApiProperty({
    type: Number,
    example: 3600,
    description: 'Frequency of pulling data in seconds',
  })
  pull_frequency?: bigint;

  @ApiProperty({
    type: String,
    example: 'https://example.com/redirect',
    description: 'Redirect URL for the project',
  })
  redirect_url?: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'User ID associated with the project',
  })
  id_user: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Connector set ID associated with the project',
  })
  id_connector_set: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { WebhookScopes } from '@panora/shared';

export class EventResponse {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the event',
  })
  id_event: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Connection ID associated with the event',
  })
  id_connection: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Project ID associated with the event',
  })
  id_project: string;

  @ApiProperty({
    type: String,
    example: 'connection.created',
    enum: WebhookScopes,
    description: 'Scope of the event',
  })
  type: string;

  @ApiProperty({
    type: String,
    example: 'success',
    enum: ['success', 'fail'],
    description: 'Status of the event',
  })
  status: string;

  @ApiProperty({
    type: String,
    example: '0',
    description: 'Direction of the event',
  })
  direction: string;

  @ApiProperty({
    type: String,
    example: 'POST',
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    description: 'HTTP method used for the event',
  })
  method: string;

  @ApiProperty({
    type: String,
    example: '/crm/companies',
    description: 'URL associated with the event',
  })
  url: string;

  @ApiProperty({
    type: String,
    example: 'hubspot',
    description: 'Provider associated with the event',
  })
  provider: string;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'Timestamp of the event',
  })
  timestamp: Date;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174003',
    description: 'Linked user ID associated with the event',
  })
  id_linked_user: string;
}

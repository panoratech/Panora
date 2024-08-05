import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
  @ApiProperty({
    type: String,
    example: 'https://acme.com/webhook_receiver',
    description: 'The endpoint url of the webhook.',
  })
  url: string;

  @ApiProperty({
    type: String,
    example: 'Webhook to receive connection events',
    description: 'The description of the webhook.',
  })
  description?: string;

  @ApiProperty({
    type: [String],
    example: ['connection.created'],
    description: 'The events that the webhook listen to.',
  })
  scope: string[];
}

export class EventPayload {
  [key: string]: any;
}

export class SignatureVerificationDto {
  @ApiProperty({
    type: Object,
    description: 'The payload event of the webhook.',
  })
  payload: { [key: string]: any };

  @ApiProperty({ type: String, description: 'The signature of the webhook.' })
  signature: string;

  @ApiProperty({ type: String, description: 'The secret of the webhook.' })
  secret: string;
}

export class WebhookResponse {
  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The unique UUID of the webhook.',
  })
  id_webhook_endpoint: string;

  @ApiProperty({
    type: String,
    example: 'Webhook to receive connection events',
    description: 'The description of the webhook.',
  })
  endpoint_description: string | null;

  @ApiProperty({
    type: String,
    example: 'https://acme.com/webhook_receiver',
    description: 'The endpoint url of the webhook.',
  })
  url: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The secret of the webhook.',
  })
  secret: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'The status of the webhook.',
  })
  active: boolean;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the webhook.',
  })
  created_at: Date;

  @ApiProperty({
    type: [String],
    example: ['connection.created'],
    description: 'The events that the webhook listen to.',
  })
  scope: string[];

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The project id tied to the webhook.',
  })
  id_project: string;

  @ApiProperty({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'The last update date of the webhook.',
  })
  last_update: Date | null;
}

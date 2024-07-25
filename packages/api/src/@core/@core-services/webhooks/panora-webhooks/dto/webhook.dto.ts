import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
  @ApiProperty({
    type: String,
    description: 'The endpoint url of the webhook.',
  })
  url: string;

  @ApiProperty({ type: String, description: 'The description of the webhook.' })
  description?: string;

  @ApiProperty({
    type: [String],
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
  @ApiProperty({ type: String, description: 'The unique UUID of the webhook.' })
  id_webhook_endpoint: string;

  @ApiProperty({ type: String, description: 'The description of the webhook.' })
  endpoint_description: string | null;

  @ApiProperty({
    type: String,
    description: 'The endpoint url of the webhook.',
  })
  url: string;

  @ApiProperty({ type: String, description: 'The secret of the webhook.' })
  secret: string;

  @ApiProperty({ type: Boolean, description: 'The status of the webhook.' })
  active: boolean;

  @ApiProperty({
    type: Date,
    description: 'The created date  of the webhook.',
  })
  created_at: Date;

  @ApiProperty({
    type: [String],
    description: 'The events that the webhook listen to.',
  })
  scope: string[];

  @ApiProperty({
    type: String,
    description: 'The project id tied to the webhook.',
  })
  id_project: string;

  @ApiProperty({
    type: Date,
    description: 'The last update date of the webhook.',
  })
  last_update: Date | null;
}

export class WebhookDto {
  url: string;
  description?: string;
  id_project: string;
  scope: string[];
}

export class SignatureVerificationDto {
  payload: { [key: string]: any };
  signature: string;
  secret: string;
}

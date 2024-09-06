export class ManagedWebhooksDto {
  id_connection: string;
  scopes: string[];
  api_version?: string;
  remote_signature_secret?: string;
}

export class SignatureVerificationDto {
  payload: { [key: string]: any };
  signature: string;
  secret: string;
}

export class RemoteThirdPartyCreationDto {
  data: { [key: string]: any };
  id_connection: string;
  mw_ids: string[];
}

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  organization_id: string;
}

export class InviteDto {
  email: string;
  organization_id: string;
}

export class DeleteMemberDto {
  memberId: string;
  organization_id: string;
}

export class SsoCreateDto {
  display_name: string;
  organization_id: string;
}

export class SsoOidcUpdateDto {
  display_name: string;
  client_id: string;
  client_secret: string;
  issuer: string;
  authorization_url: string;
  token_url: string;
  userinfo_url: string;
  jwks_url: string;
  connection_id: string;
  organization_id: string;
}

export class SsoSamlUpdateDto {
  display_name: string;
  idp_sso_url: string;
  idp_entity_id: string;
  email_attribute: string;
  first_name_attribute: string;
  last_name_attribute: string;
  certificate: string;
  connection_id: string;
  organization_id: string;
}

export class DiscoveryCreateDto {
  organization_name: string;
  require_mfa?: boolean;
}
export class DiscoveryStartDto {
  email: string;
}

export class SendSsoSmsDto {
  orgID: string;
  memberID: string;
  phone_number: string;
}

export class AuthSsoSmsMfaDto {
  orgID: string;
  memberID: string;
  code: string;
}

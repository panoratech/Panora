import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';
import {
  AuthSsoSmsMfaDto,
  DeleteMemberDto,
  DiscoveryCreateDto,
  DiscoveryStartDto,
  InviteDto,
  LoginDto,
  SendSsoSmsDto,
  SsoCreateDto,
  SsoOidcUpdateDto,
  SsoSamlUpdateDto,
} from './dto/stytch.dto';
import * as stytch from 'stytch';
import { EnvironmentService } from '@@core/environment/environment.service';
import { StytchError } from 'stytch';
import { Request } from 'express';

type ExchangeResult = { kind: 'discovery' | 'login'; token: string };

export const SESSION_DURATION_MINUTES = 60;

@Injectable()
export class StytchService {
  private stytchClient: stytch.B2BClient;

  constructor(private logger: LoggerService, private env: EnvironmentService) {
    this.logger.setContext(StytchService.name);
    this.stytchClient = new stytch.B2BClient({
      project_id: this.env.getStytchProjectId(),
      secret: this.env.getStytchSecret(),
    });
  }

  async login(data: LoginDto) {
    const { email, organization_id } = data;
    try {
      await this.stytchClient.magicLinks.email.loginOrSignup({
        email_address: email,
        organization_id: organization_id,
        login_redirect_url: `${this.env.getOAuthRredirectBaseUrl()}/auth/stytch/callback`,
        signup_redirect_url: `${this.env.getOAuthRredirectBaseUrl()}/auth/stytch/callback`,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async logout(token: string) {
    // Call Stytch in the background to terminate the session
    // But don't block on it!
    await this.stytchClient.sessions
      .revoke({ session_jwt: token })
      .then(() => {
        console.log('Session successfully revoked');
      })
      .catch((err) => {
        console.error('Could not revoke session', err);
      });
  }

  async invite(data: InviteDto) {
    const { email, organization_id } = data;
    try {
      await this.stytchClient.magicLinks.email.invite({
        email_address: email,
        organization_id: organization_id,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async deleteMember(data: DeleteMemberDto) {
    const { memberId: member_id, organization_id } = data;
    try {
      await this.stytchClient.organizations.members.delete({
        organization_id,
        member_id,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createSsoOidc(data: SsoCreateDto) {
    const { display_name, organization_id } = data;
    try {
      await this.stytchClient.sso.oidc.createConnection({
        organization_id,
        display_name,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async updateSsoOidc(data: SsoOidcUpdateDto) {
    try {
      await this.stytchClient.sso.oidc.updateConnection({
        organization_id: data.organization_id,
        connection_id: data.connection_id,
        display_name: data.display_name,
        client_id: data.client_id,
        client_secret: data.client_secret,
        issuer: data.issuer,
        authorization_url: data.authorization_url,
        token_url: data.token_url,
        userinfo_url: data.userinfo_url,
        jwks_url: data.jwks_url,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createSsoSaml(data: SsoCreateDto) {
    const { display_name, organization_id } = data;
    try {
      await this.stytchClient.sso.saml.createConnection({
        organization_id,
        display_name,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async updateSsoSaml(data: SsoSamlUpdateDto) {
    try {
      await this.stytchClient.sso.saml.updateConnection({
        organization_id: data.organization_id,
        connection_id: data.connection_id,
        idp_entity_id: data.idp_entity_id,
        display_name: data.display_name,
        attribute_mapping: {
          email: data.email_attribute,
          first_name: data.first_name_attribute,
          last_name: data.last_name_attribute,
        },
        x509_certificate: data.certificate,
        idp_sso_url: data.idp_sso_url,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async authSsoSmsMfa(data: AuthSsoSmsMfaDto) {
    const { orgID, memberID, code } = data;
    const discoverySessionData: any = {}; //TODO;
    try {
      await this.stytchClient.otps.sms.authenticate({
        organization_id: orgID,
        member_id: memberID,
        code: code,
        intermediate_session_token: discoverySessionData.intermediateSession,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async sendSsoSms(data: SendSsoSmsDto) {
    const { orgID, memberID, phone_number } = data;
    try {
      await this.stytchClient.otps.sms.send({
        organization_id: orgID,
        member_id: memberID,
        mfa_phone_number: phone_number,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getDiscoverySessionData(req: Request) {
    const sessionJWT = req.cookies['session'];
    if (sessionJWT) {
      return {
        sessionJWT,
        intermediateSession: undefined,
        isDiscovery: false,
        error: false,
      };
    }

    const intermediateSession = req.cookies['intermediate_session'];
    if (intermediateSession) {
      return {
        sessionJWT: undefined,
        intermediateSession,
        isDiscovery: true,
        error: false,
      };
    }
    return { error: true };
  }

  async getDiscoveryOrgs(sessionData: any) {
    const discoveredOrganizations =
      await this.stytchClient.discovery.organizations.list({
        intermediate_session_token: sessionData.intermediateSession,
        session_jwt: sessionData.sessionJWT,
      });
    return discoveredOrganizations;
  }

  async discoveryOrg(id: string, req: Request) {
    const discoverySessionData = await this.getDiscoverySessionData(req);
    if (discoverySessionData.error) {
      console.log('No session tokens found...');
      return { redirect: { statusCode: 307, destination: `/login` } };
    }

    if (!id || Array.isArray(id)) {
      throw new Error('redirect because org id is invalid');
    }

    const exchangeSession = () => {
      if (discoverySessionData.isDiscovery) {
        return this.stytchClient.discovery.intermediateSessions.exchange({
          intermediate_session_token: discoverySessionData.intermediateSession,
          organization_id: id,
          session_duration_minutes: 60,
        });
      }
      return this.stytchClient.sessions.exchange({
        organization_id: id,
        session_jwt: discoverySessionData.sessionJWT,
      });
    };

    try {
      return await exchangeSession();
    } catch (error) {
      console.error('Could not authenticate in callback', error);
      handleServiceError(error, this.logger);
    }
  }

  async verifySession(sessionJWT: string) {
    try {
      const sessionAuthRes = await this.stytchClient.sessions.authenticate({
        session_duration_minutes: 30, // extend the session a bit
        session_jwt: sessionJWT,
      });
      return sessionAuthRes;
    } catch (err) {
      console.error('Could not find member by session token', err);
      throw Error(err);
    }
  }

  async startDiscovery(data: DiscoveryStartDto) {
    const { email } = data;
    try {
      await this.stytchClient.magicLinks.email.discovery.send({
        email_address: email,
        discovery_redirect_url: `${this.env.getOAuthRredirectBaseUrl()}/auth/stytch/callback`,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createDiscovery(data: DiscoveryCreateDto) {
    const { organization_name, require_mfa } = data;
    try {
      const { member, organization, session_jwt, intermediate_session_token } =
        await this.stytchClient.discovery.organizations.create({
          intermediate_session_token: '', //intermediateSession,
          email_allowed_domains: [],
          organization_name: organization_name,
          organization_slug: organization_name, //TODO:
          session_duration_minutes: 60,
          mfa_policy: require_mfa ? 'REQUIRED_FOR_ALL' : 'OPTIONAL',
        });

      // Make the organization discoverable to other emails
      try {
        await this.stytchClient.organizations.update({
          organization_id: organization.organization_id,
          email_jit_provisioning: 'RESTRICTED',
          sso_jit_provisioning: 'ALL_ALLOWED',
          email_allowed_domains: [member.email_address.split('@')[1]],
        });
      } catch (e) {
        if (
          e instanceof StytchError &&
          e.error_type == 'organization_settings_domain_too_common'
        ) {
          console.log(
            'User domain is common email provider, cannot link to organization',
          );
        } else {
          throw e;
        }
      }

      // Mark the first user in the organization as the admin
      await this.stytchClient.organizations.members.update({
        organization_id: organization.organization_id,
        member_id: member.member_id,
        trusted_metadata: { admin: true },
      });

      return {
        member,
        organization,
        session_jwt,
        intermediate_session_token,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async handleCallback(slug: string, stytch_token_type: string, token: string) {
    try {
      return await this.exchangeToken(stytch_token_type, token);
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async exchangeToken(
    stytch_token_type: string,
    token: string,
  ): Promise<ExchangeResult> {
    if (stytch_token_type === 'multi_tenant_magic_links' && token) {
      return await this.handleMagicLinkCallback(token);
    }

    if (stytch_token_type === 'sso' && token) {
      return await this.handleSSOCallback(token);
    }

    if (stytch_token_type === 'discovery' && token) {
      return await this.handleEmailMagicLinksDiscoveryCallback(token);
    }

    if (stytch_token_type === 'discovery_oauth' && token) {
      return await this.handleOAuthDiscoveryCallback(token);
    }

    if (stytch_token_type === 'oauth' && token) {
      return await this.handleOAuthCallback(token);
    }

    console.log('No token found in req.query', token);
    throw Error('No token found');
  }

  async handleMagicLinkCallback(token: string): Promise<ExchangeResult> {
    const authRes = await this.stytchClient.magicLinks.authenticate({
      magic_links_token: token as string,
      session_duration_minutes: SESSION_DURATION_MINUTES,
    });

    return {
      kind: 'login',
      token: authRes.session_jwt as string,
    };
  }

  async handleSSOCallback(token: string): Promise<ExchangeResult> {
    const authRes = await this.stytchClient.sso.authenticate({
      sso_token: token as string,
      session_duration_minutes: SESSION_DURATION_MINUTES,
    });

    return {
      kind: 'login',
      token: authRes.session_jwt as string,
    };
  }

  async handleEmailMagicLinksDiscoveryCallback(
    token: string,
  ): Promise<ExchangeResult> {
    const authRes = await this.stytchClient.magicLinks.discovery.authenticate({
      discovery_magic_links_token: token as string,
    });

    return {
      kind: 'discovery',
      token: authRes.intermediate_session_token as string,
    };
  }

  async handleOAuthDiscoveryCallback(token: string): Promise<ExchangeResult> {
    const authRes = await this.stytchClient.oauth.discovery.authenticate({
      discovery_oauth_token: token as string,
    });

    return {
      kind: 'discovery',
      token: authRes.intermediate_session_token as string,
    };
  }

  async handleOAuthCallback(token: string): Promise<ExchangeResult> {
    const authRes = await this.stytchClient.oauth.authenticate({
      oauth_token: token as string,
      session_duration_minutes: SESSION_DURATION_MINUTES,
    });

    return {
      kind: 'login',
      token: authRes.session_jwt as string,
    };
  }
}

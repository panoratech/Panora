import * as stytch from "stytch";

let client: stytch.B2BClient;

export const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;

export type Member = Awaited<
  ReturnType<typeof client.magicLinks.authenticate>
>["member"];
export type Organization = Awaited<
  ReturnType<typeof client.organizations.get>
>["organization"];
export type SessionsAuthenticateResponse = Awaited<
  ReturnType<typeof client.sessions.authenticate>
>;
export type SAMLConnection = Awaited<
  ReturnType<typeof client.sso.saml.createConnection>
>["connection"];

export type OIDCConnection = Awaited<
  ReturnType<typeof client.sso.oidc.createConnection>
>["connection"];

export type DiscoveredOrganizations = Awaited<
  ReturnType<typeof client.discovery.organizations.list>
>["discovered_organizations"];

const stytchEnv =
  process.env.NEXT_PUBLIC_STYTCH_PROJECT_ENV === "live"
    ? stytch.envs.live
    : stytch.envs.test;

export const formatSSOStartURL = (redirectDomain: string, connection_id: string): string => {
  const redirectURL = redirectDomain + "/api/callback";
  return `${stytchEnv}public/sso/start?connection_id=${connection_id}&public_token=${publicToken}&login_redirect_url=${redirectURL}`;
};

// No need to worry about CNames for OAuth Start URL's as Stytch will automatically redirect to the registered CName
export const formatOAuthDiscoveryStartURL = (redirectDomain: string, provider: string): string => {
    const redirectURL = redirectDomain + "/api/callback";
    return `${stytchEnv}b2b/public/oauth/${provider}/discovery/start?public_token=${publicToken}&discovery_redirect_url=${redirectURL}`;
};

export const formatOAuthStartURL = (redirectDomain: string, provider: string, org_slug: string): string => {
  const redirectURL = redirectDomain + "/api/callback";
  return `${stytchEnv}b2b/public/oauth/${provider}/start?public_token=${publicToken}&slug=${org_slug}&login_redirect_url=${redirectURL}`;
};

const loadStytch = () => {
  if (!client) {
    client = new stytch.B2BClient({
      project_id: process.env.STYTCH_PROJECT_ID || "",
      secret: process.env.STYTCH_SECRET || "",
      env: stytchEnv,
    });
  }

  return client;
};

export default loadStytch;

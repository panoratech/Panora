export const discoveryStart = async (email: string) =>
  fetch("/api/discovery/start", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

export const login = async (email: string, organization_id: string) =>
  fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      organization_id,
    }),
  });

export const invite = async (email: string) =>
  fetch("/api/invite", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

export const deleteMember = async (member_id: string) =>
  fetch("/api/delete_member", {
    method: "POST",
    body: JSON.stringify({
      member_id,
    }),
  });

export const createSamlSSOConn = async (display_name: string) =>
  fetch("/api/sso/saml/create", {
    method: "POST",
    body: JSON.stringify({
      display_name,
    }),
  });

export const createOrganizationFromDiscovery = async (
  organization_name: string
) =>
  fetch("/api/discovery/create", {
    method: "POST",
    body: JSON.stringify({
      organization_name,
    }),
  });

export const updateSamlSSOConn = async ({
  display_name,
  idp_sso_url,
  idp_entity_id,
  email_attribute,
  first_name_attribute,
  last_name_attribute,
  certificate,
  connection_id,
}: {
  display_name: string;
  idp_sso_url: string;
  idp_entity_id: string;
  email_attribute: string;
  first_name_attribute: string;
  last_name_attribute: string;
  certificate: string;
  connection_id: string;
}) =>
  fetch("/api/sso/saml/update", {
    method: "POST",
    body: JSON.stringify({
      display_name,
      idp_sso_url,
      idp_entity_id,
      email_attribute,
      first_name_attribute,
      last_name_attribute,
      certificate,
      connection_id,
    }),
  });

export const createOidcSSOConn = async (display_name: string) =>
  fetch("/api/sso/oidc/create", {
    method: "POST",
    body: JSON.stringify({
      display_name,
    }),
  });

export const updateOidcSSOConn = async ({
  display_name,
  client_id,
  client_secret,
  issuer,
  authorization_url,
  token_url,
  userinfo_url,
  jwks_url,
  connection_id,
}: {
  display_name: string;
  client_id: string;
  client_secret: string;
  issuer: string;
  authorization_url: string;
  token_url: string;
  userinfo_url: string;
  jwks_url: string;
  connection_id: string;
}) =>
  fetch("/api/sso/oidc/update", {
    method: "POST",
    body: JSON.stringify({
      display_name,
      client_id,
      client_secret,
      issuer,
      authorization_url,
      token_url,
      userinfo_url,
      jwks_url,
      connection_id,
    }),
  });

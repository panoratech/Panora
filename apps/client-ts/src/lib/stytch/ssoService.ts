import loadStytch from "./loadStytch";

const stytch = loadStytch();


export const list = async (organization_id: string) => {
  return stytch.sso.getConnections({ organization_id });
};
export const createSaml = async (display_name: string, organization_id: string) => {
  return stytch.sso.saml.createConnection({
    organization_id,
    display_name,
  });
};
export const createOidc = async (display_name: string, organization_id: string) => {
  return stytch.sso.oidc.createConnection({
    organization_id,
    display_name,
  });
};
// export const delete = async (member_id: string, organization_id: string) => {
//   return stytch.organizations.members.delete({
//     organization_id,
//     member_id,
//   })
// }
// export const findBySessionToken = async function (sessionToken: string): Promise<Member | null> => {
//   return stytch.sessions.authenticate({
//     session_duration_minutes: 30, // extend the session a bit
//     session_token: sessionToken
//   })
//     .then(res => {
//       return res.member
//     })
//     .catch(err => {
//       console.error('Could not find member by session token', err)
//       return null
//     })
// }


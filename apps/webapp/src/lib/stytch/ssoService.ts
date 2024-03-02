import loadStytch from "./loadStytch";

const stytch = loadStytch();

export const list = async (organization_id: string) => {
  return stytch.sso.getConnections({ organization_id });
};

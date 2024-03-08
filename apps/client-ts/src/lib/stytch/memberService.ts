import loadStytch from "./loadStytch";

const stytch = loadStytch();


export const invite = async (email: string, organization_id: string) => {
  return stytch.magicLinks.email.invite({
    email_address: email,
    organization_id: organization_id,
  });
};

export const deleteMember = async (member_id: string, organization_id: string) => {
  return stytch.organizations.members.delete({
    organization_id,
    member_id,
  });
}


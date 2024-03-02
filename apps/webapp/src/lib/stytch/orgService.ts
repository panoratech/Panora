import loadStytch, { Member, Organization } from "./loadStytch";

const stytch = loadStytch();

export const findByID = async (organization_id: string): Promise<Organization | null> => {
  const orgGetPromise = stytch.organizations.get({ organization_id });

  try {
    const orgResult = await orgGetPromise;
    const org = orgResult.organization;
    console.log("Organization found for id", organization_id);
    return org;
  } catch (e) {
    console.error("Failed to search for org by id", organization_id);
    return null;
  }
};

export const findBySlug = async (slug: string): Promise<Organization | null> => {
  const orgSearchPromise = stytch.organizations.search({
    query: {
      operator: "AND",
      operands: [{ filter_name: "organization_slugs", filter_value: [slug] }],
    },
  });

  try {
    const orgResult = await orgSearchPromise;
    if (orgResult.organizations.length == 0) {
      console.error("Organization not found for slug", slug);
      return null;
    }
    const org = orgResult.organizations[0];
    console.log("Organization found for slug", slug);
    return org;
  } catch (e) {
    console.error("Failed to search for org by slug", e);
    return null;
  }
};

export const findAllMembers = async (organization_id: string): Promise<Member[]> => {
  return stytch.organizations.members
    .search({
      organization_ids: [organization_id],
    })
    .then((res) => res.members);
}

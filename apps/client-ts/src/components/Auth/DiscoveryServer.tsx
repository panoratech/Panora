import loadStytch, { DiscoveredOrganizations } from "@/lib/stytch/loadStytch";
import { getDiscoverySessionData } from "@/lib/stytch/sessionService";
import { cookies } from "next/headers";
import Link from "next/link";

async function getProps() {
    const discoverySessionData = getDiscoverySessionData(
      cookies().get('session')?.value,
      cookies().get('intermediate_session')?.value,
    );
    if (discoverySessionData.error) {
      console.log("No session tokens found...");
      return { redirect: { statusCode: 307, destination: `/auth/login` } };
    }
  
    const { discovered_organizations } =
      await loadStytch().discovery.organizations.list({
        intermediate_session_token: discoverySessionData.intermediateSession,
        session_jwt: discoverySessionData.sessionJWT,
      });
  
    console.log(discovered_organizations);
  
    return {
      discovered_organizations
    };
}

type Props = {
    discovered_organizations: DiscoveredOrganizations;
};

const DiscoveredOrganizationsList = ({ discovered_organizations }: Props) => {
    const formatMembership = ({
      membership, 
      organization,
    }: Pick<DiscoveredOrganizations[0], "membership" | "organization">) => {
      if (membership!.type === "pending_member") {
        return `Join ${organization!.organization_name}`;
      }
      if (membership!.type === "eligible_to_join_by_email_domain") {
        return `Join ${organization!.organization_name} via your ${membership!.details!.domain} email`;
      }
      if (membership!.type === "invited_member") {
        return `Accept Invite for ${organization!.organization_name}`;
      }
      return `Continue to ${organization!.organization_name}`;
    };
  
    return (
      <div className="section">
        <h3>Your Organizations</h3>
        {discovered_organizations.length === 0 && (
          <p>No existing organizations.</p>
        )}
        <ul>
          {discovered_organizations.map(({ organization, membership }) => (
            <li key={organization!.organization_id}>
              <Link href={`/api/discovery/${organization!.organization_id}`}>
                <span>{formatMembership({ organization, membership })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
const DiscoveryServer = async () => {
    const {discovered_organizations} = await getProps();
    return (
        <DiscoveredOrganizationsList
            discovered_organizations={discovered_organizations!}
        />
    );
};

export default DiscoveryServer;
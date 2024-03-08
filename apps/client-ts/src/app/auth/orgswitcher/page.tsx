import Link from "next/link";
import loadStytch from "@/lib/stytch/loadStytch";
import {
  getAuthData,
  getDiscoverySessionData,
} from "@/lib/stytch/sessionService";
import { cookies, headers } from "next/headers";

async function getProps() {
  const authHeader = headers().get('x-session');
  const { member } = getAuthData(authHeader);
  const discoverySessionData = getDiscoverySessionData(
    cookies().get('session')?.value,
    cookies().get('intermediate_session')?.value,
  );
  if (discoverySessionData.error) {
    console.log("No session tokens found...");
    return { redirect: { statusCode: 307, destination: `/login` } };
  }

  const { discovered_organizations } =
    await loadStytch().discovery.organizations.list({
      intermediate_session_token: discoverySessionData.intermediateSession,
      session_jwt: discoverySessionData.sessionJWT,
    });

  return {
    user: member,
    discovered_organizations,
  }
}

const OrgSwitcherList = async () => {
  const {user, discovered_organizations} = await getProps();
  return (
    <div className="section">
      <h3>Your Organizations</h3>
      <ul>
        {discovered_organizations!.map(({ organization }) => (
          <li key={organization!.organization_id}>
            <Link href={`/api/discovery/${organization!.organization_id}`}>
              <span>{organization!.organization_name}</span>
              {organization!.organization_id === user!.organization_id && (
                <span>&nbsp;(Active)</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const OrgSwitcher = async () => {
  return (
    <div className="card">
      <OrgSwitcherList />
    </div>
  );
};


export default OrgSwitcher;

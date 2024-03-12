import Link from "next/link";
import loadStytch from "@/lib/stytch/loadStytch";
import {
  getAuthData,
  getDiscoverySessionData,
} from "@/lib/stytch/sessionService";
import { cookies } from "next/headers";
import { DiscoveredOrganization, Member } from "stytch";

const stytch = loadStytch();

async function getProps() {
  const sessionJWT = cookies().get("session");

  if (!sessionJWT) {
    throw new Error("no jwt set");
    //return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  let sessionAuthRes;
  try {
    sessionAuthRes = await stytch.sessions.authenticate({
      session_duration_minutes: 30,
      session_jwt: sessionJWT.value,
    });
    console.log("sessionauthres is "+ JSON.stringify(sessionAuthRes));
  } catch (err) {
    console.log(err);
    return err;
  }  
  const { member } = getAuthData(JSON.stringify(sessionAuthRes));
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

  return {
    user: member,
    discovered_organizations,
  }
}
interface ResponseProps {
  user: Member;
  discovered_organizations: DiscoveredOrganization[];
}
const OrgSwitcherList = async () => {
  const {user, discovered_organizations} = await getProps() as ResponseProps;
  
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

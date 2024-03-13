import Link from "next/link";
import loadStytch from "@/lib/stytch/loadStytch";
import {
  getAuthData,
  getDiscoverySessionData,
} from "@/lib/stytch/sessionService";
import { cookies } from "next/headers";
import { DiscoveredOrganization, Member } from "stytch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";

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
    <div className="ml-[200px] p-10">
      <Card>
      <CardHeader>
        <CardTitle>Your Organizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="grid gap-6">
              {discovered_organizations!.map(({ organization }) => (
                  <div key={organization?.organization_id} className="">
                  <Link href={`/api/discovery/${organization!.organization_id}`}>
                    <Badge>{organization!.organization_name}</Badge>
                  </Link>
                  {organization!.organization_id === user!.organization_id && (
                      <Badge variant={"outline"} className="ml-2">active</Badge>
                  )}
                  </div>
              ))}
            </div>
        </div>
      </CardContent>
      </Card>
      
    </div>
  );
};

const OrgSwitcher = async () => {
  return (
    <div className="">
      <OrgSwitcherList />
    </div>
  );
};


export default OrgSwitcher;

import { getAuthData } from "@/lib/stytch/sessionService";
import { findAllMembers, findByID } from "@/lib/stytch/orgService";
import { list } from "@/lib/stytch/ssoService";
import { cookies } from "next/headers";
import DashboardClient from "@/components/Auth/DashboardClient";
import loadStytch, { Member, OIDCConnection, Organization, SAMLConnection } from "@/lib/stytch/loadStytch";

const stytch = loadStytch();

interface ResultProps {
  props: {
    org: Organization; // Replace with actual type
    user: Member; // Replace with actual type
    members: Member[]; // Replace with actual type
    saml_connections: SAMLConnection[]; // Replace with actual type
    oidc_connections: OIDCConnection[]; // Replace with actual type
  };
}

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
  const org = await findByID(member.organization_id);

  if (org === null) {
    return { redirect: { statusCode: 307, destination: `/auth/login` } };
  }

  const [members, ssoConnections] = await Promise.all([
    findAllMembers(org.organization_id),
    list(org.organization_id),
  ]); 

  return {
    props: {
      org,
      user: member,
      members,
      saml_connections: ssoConnections.saml_connections ?? [],
      oidc_connections: ssoConnections.oidc_connections ?? [],
    },
  };
}

const Dashboard = async () => {
  const result: ResultProps = await getProps() as ResultProps;

  if (!result.props) {
    return null;
  }

  const {
    org,
    user,
    members,
    saml_connections,
    oidc_connections,
  }  = result.props;
  
  return (
    <DashboardClient org={org} user={user} members={members} saml_connections={saml_connections} oidc_connections={oidc_connections}/>
  ); 
};


export default Dashboard;

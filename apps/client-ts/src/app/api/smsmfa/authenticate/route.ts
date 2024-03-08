import { NextRequest, NextResponse } from "next/server";
import loadStytch from "@/lib/stytch/loadStytch";
import {
  clearIntermediateSession,
  getDiscoverySessionData,
  setSession,
} from "@/lib/stytch/sessionService";

const stytchClient = loadStytch();

export async function POST(req: NextRequest, res: NextResponse) {
  const discoverySessionData = getDiscoverySessionData(req.cookies.get('session')?.value, req.cookies.get('intermediate_session')?.value);
  if (discoverySessionData.error) {
    console.log("No session tokens found...");
    return { redirect: { statusCode: 307, destination: `/login` } };
  }

  const { orgID, memberID, code } = await req.json();

  const authSMSMFAOTP = () => {
    return stytchClient.otps.sms.authenticate({
      organization_id: orgID,
      member_id: memberID,
      code: code,
      intermediate_session_token: discoverySessionData.intermediateSession,
    });
  };

  try {
    const { session_jwt, organization } = await authSMSMFAOTP();
    setSession(req, res, session_jwt);
    clearIntermediateSession(req, res);
    return res.redirect(307, `/${organization.organization_slug}/dashboard`);
  } catch (error) {
    console.error("Could not authenticate in callback", error);

    return NextResponse.redirect("/discovery");
  }
}

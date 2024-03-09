import { NextRequest, NextResponse } from "next/server";
import loadStytch from "@/lib/stytch/loadStytch";

const stytchClient = loadStytch();

export async function POST(req: NextRequest) {
  const { orgID, memberID, phone_number } = await req.json();

  const sendSMSMFAOTP = () => {
    return stytchClient.otps.sms.send({
      organization_id: orgID,
      member_id: memberID,
      mfa_phone_number: phone_number,
    });
  };

  try {
    const resp = await sendSMSMFAOTP();
    return NextResponse.redirect(new URL(`/${resp.organization.organization_slug}/smsmfa?sent=true&org_id=${resp.organization.organization_id}&member_id=${resp.member.member_id}`, req.url));
  } catch (error) {
    console.error("Could not send in callback", error);
    return NextResponse.redirect(new URL("/auth/discovery", req.url))
  }
}


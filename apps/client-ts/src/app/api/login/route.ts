// This API route sends a magic link to the specified email address.
import { NextRequest, NextResponse } from "next/server";
import { getDomainFromRequest } from "@/lib/stytch/urlUtils";
import loadStytch from "@/lib/stytch/loadStytch";

export async function POST(req: NextRequest) {
  const stytchClient = loadStytch();
  const { email, organization_id } = JSON.parse(await req.json());
  const query = req.nextUrl.searchParams;
  const domain = getDomainFromRequest(query.get("host") as string,query.get("x-forwarded-proto") as string);
  try {
    await stytchClient.magicLinks.email.loginOrSignup({
      email_address: email,
      organization_id: organization_id,
      login_redirect_url: `${domain}/api/callback`,
      signup_redirect_url: `${domain}/api/callback`,
    });
    return NextResponse.json({
      message: "Success"
    }, {
      status: 200,
    })
  } catch (error) {
    console.log("error sending magic link", error);
    const errorString = JSON.stringify(error);
    return NextResponse.json({
      message: `Error ${errorString}`
    }, {
      status: 400,
    })  }
}
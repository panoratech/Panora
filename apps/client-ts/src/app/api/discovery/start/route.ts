// This API route sends a magic link to the specified email address.
import { NextRequest, NextResponse } from "next/server";
import { getDomainFromRequest } from "@/lib/stytch/urlUtils";
import loadStytch from "@/lib/stytch/loadStytch";

export async function POST(
  req: NextRequest,
) {
  const stytchClient = loadStytch();
  const { email } = await req.json();
  //const query = req.nextUrl.searchParams;
  //const domain = getDomainFromRequest(query.get("host") as string,query.get("x-forwarded-proto") as string);
  try {
    await stytchClient.magicLinks.email.discovery.send({
      email_address: email,
      discovery_redirect_url: `${process.env.NEXT_PUBLIC_WEBAPP_DOMAIN}/api/callback`, //${domain}
    });
    return NextResponse.json({
      message: "Success"
    }, {
      status: 200,
    })  
  } catch (error) {
    const errorString = JSON.stringify(error);
    console.log(error);
    return NextResponse.json({
      message: `Error ${errorString}`
    }, {
      status: 400,
    })  }
}


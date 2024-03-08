// This API route updates the specified OIDC connection.
import { NextRequest, NextResponse } from "next/server";
import loadStytch, { Member } from "@/lib/stytch/loadStytch";
import { adminOnlyAPIRoute } from "@/lib/stytch/sessionService";

export async function POST(
  member: Member,
  req: NextRequest,
  res: NextResponse
) {
  try {
    const {
      connection_id,
      display_name,
      client_id,
      client_secret,
      issuer,
      authorization_url,
      token_url,
      userinfo_url,
      jwks_url,
    } = JSON.parse(await req.json());

    await loadStytch().sso.oidc.updateConnection({
      organization_id: member.organization_id,
      connection_id,
      display_name: display_name,
      client_id: client_id,
      client_secret: client_secret,
      issuer: issuer,
      authorization_url: authorization_url,
      token_url: token_url,
      userinfo_url: userinfo_url,
      jwks_url: jwks_url,
    });
    return NextResponse.json({
      message: `Success`
    }, {
      status: 200,
    }) 
  } catch (e) {
    console.error("Failed to update OIDC connection", e);
    return NextResponse.json({
      message: `Success`
    }, {
      status: 400,
    }) 
  }
}

export default adminOnlyAPIRoute(POST);

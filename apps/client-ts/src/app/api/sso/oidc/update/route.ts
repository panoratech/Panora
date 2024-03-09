// This API route updates the specified OIDC connection.
import { NextRequest, NextResponse } from "next/server";
import loadStytch, { Member } from "@/lib/stytch/loadStytch";

export async function POST(
  req: NextRequest,
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
    } = await req.json();
    
    const organization_id = req.headers.get("x-member-org");
    if(!organization_id){
      return NextResponse.json({
        message: "Error"
      }, {
        status: 400,
      })
    }
    await loadStytch().sso.oidc.updateConnection({
      organization_id: organization_id,
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

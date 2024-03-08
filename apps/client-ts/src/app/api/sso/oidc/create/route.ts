// This API route creates an OIDC connection
import { NextRequest, NextResponse } from "next/server";
import { adminOnlyAPIRoute } from "@/lib/stytch/sessionService";
import { Member } from "@/lib/stytch/loadStytch";
import { createOidc } from "@/lib/stytch/ssoService";

export async function POST(
  member: Member,
  req: NextRequest,
) {
  try {
    const { display_name } = JSON.parse(await req.json());
    const { connection } = await createOidc(
      display_name,
      member.organization_id
    );
    console.log(
      "Successfully created new OIDC connection",
      connection!.connection_id
    );
    return NextResponse.json({
      message: `Success connection ${connection}`
    }, {
      status: 200,
    }) 
    } catch (e) {
    console.error("Failed to create OIDC connection", e);
    return NextResponse.json({
      message: `Error`
    }, {
      status: 400,
    })   
  }
}

export default adminOnlyAPIRoute(POST);

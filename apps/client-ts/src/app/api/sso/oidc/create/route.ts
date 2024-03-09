// This API route creates an OIDC connection
import { NextRequest, NextResponse } from "next/server";
import { createOidc } from "@/lib/stytch/ssoService";

export async function POST(
  req: NextRequest,
) {
  try {
    const { display_name } = await req.json();
    const organization_id = req.headers.get("x-member-org");
    if(!organization_id){
      return NextResponse.json({
        message: "Error"
      }, {
        status: 400,
      })
    }
    const { connection } = await createOidc(
      display_name,
      organization_id
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

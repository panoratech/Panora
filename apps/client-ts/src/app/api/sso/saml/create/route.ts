// This API route creates a new SAML connection
import { NextRequest, NextResponse } from "next/server";
import { createSaml } from "@/lib/stytch/ssoService";

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
    const { connection } = await createSaml(
      display_name,
      organization_id
    );
    console.log(
      "Successfully created new SAML connection",
      connection!.connection_id
    );
    return NextResponse.json({
      message: `Success connection ${connection}`
    }, {
      status: 200,
    })  
  } catch (e) {
    console.error("Failed to create SAML connection", e);
    return NextResponse.json({
      message: `Error`
    }, {
      status: 400,
    })   
  }
}

// This API route sends a magic link to the specified email address.
import { NextRequest, NextResponse } from "next/server";
import loadStytch, { Member } from "@/lib/stytch/loadStytch";

export async function POST(
  req: NextRequest,
) {
  try {
    const {
      display_name,
      idp_sso_url,
      idp_entity_id,
      email_attribute,
      first_name_attribute,
      last_name_attribute,
      certificate,
      connection_id,
    } = await req.json();
    const organization_id = req.headers.get("x-member-org");
    if(!organization_id){
      return NextResponse.json({
        message: "Error"
      }, {
        status: 400,
      })
    }
    await loadStytch().sso.saml.updateConnection({
      organization_id: organization_id,
      connection_id,
      idp_entity_id: idp_entity_id,
      display_name: display_name,
      attribute_mapping: {
        email: email_attribute,
        first_name: first_name_attribute,
        last_name: last_name_attribute,
      },
      x509_certificate: certificate,
      idp_sso_url: idp_sso_url,
    });
    return NextResponse.json({
      message: `Success`
    }, {
      status: 200,
    }) 
    } catch (e) {
    console.error("Failed to update SAML connection", e);
    return NextResponse.json({
      message: `Error`
    }, {
      status: 400,
    }) 
  }
}

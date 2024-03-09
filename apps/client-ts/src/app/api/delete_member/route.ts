import { NextRequest, NextResponse } from "next/server";
import { deleteMember } from "@/lib/stytch/memberService";

export async function POST(
  req: NextRequest,
) {
  try {
    const { member_id } = await req.json();
    const organization_id = req.headers.get("x-member-org");
    if(!organization_id){
      return NextResponse.json({
        message: "Error"
      }, {
        status: 400,
      })
    }
    await deleteMember(member_id, organization_id);
    console.log("Successfully deleted", member_id);
    return NextResponse.json({
      message: "Success"
    }, {
      status: 200,
    })
  } catch (e) {
    console.error("Failed to send invite", e);
    return NextResponse.json({
      message: "Error"
    }, {
      status: 400,
    })
  }
}
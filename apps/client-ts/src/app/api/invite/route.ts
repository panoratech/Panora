// This API route sends a magic link to the specified email address.
import { NextRequest, NextResponse } from "next/server";
import { Member } from "@/lib/stytch/loadStytch";
import { adminOnlyAPIRoute } from "@/lib/stytch/sessionService";
import { invite } from "@/lib/stytch/memberService";

export async function POST(
  member: Member,
  req: NextRequest,
) {
  try {
    const { email } = JSON.parse(await req.json());
    // Infer the organization_id from the member's org - don't let members invite
    // themselves to other organizations
    await invite(email, member.organization_id);
    console.log("Successfully sent invite to", email);
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

export default adminOnlyAPIRoute(POST);

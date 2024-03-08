import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import loadStytch, { Member, Organization } from '@/lib/stytch/loadStytch';
import { clearIntermediateSession, clearSession, exchangeToken, getDiscoverySessionData, revokeSession, setIntermediateSession, setSession } from '@/lib/stytch/sessionService';
import { toDomain } from '@/lib/utils';
import { MfaRequired } from 'stytch';

const stytch = loadStytch();

function redirectToSMSMFA(organization: Organization, member: Member, mfa_required: MfaRequired | null ) {
  if(mfa_required != null && mfa_required.secondary_auth_initiated == "sms_otp") {
    // An OTP code is automatically sent if Stytch knows the member's phone number
    return `/${organization.organization_slug}/smsmfa?sent=true&org_id=${organization.organization_id}&member_id=${member.member_id}`;
  }
  return `/${organization.organization_slug}/smsmfa?sent=false&org_id=${organization.organization_id}&member_id=${member.member_id}`;
}


export async function middleware(request: NextRequest) {

  if (request.nextUrl.pathname.startsWith('/api/callback')) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('slug');

    return exchangeToken(request)
      .then((exchangeResult) => {
        if (exchangeResult.kind === "login") {
          const response = NextResponse.redirect(new URL(`/${query}/dashboard`, request.url));
          setSession(response, exchangeResult.token); // Set session using response cookies.
          return response;
        } else {
          const response = NextResponse.redirect(new URL(`/discovery`, request.url));
          setIntermediateSession(response, exchangeResult.token); // Set intermediate session using response cookies.
          return response;
        }
      })
      .catch((error) => {
        return NextResponse.redirect(new URL("/login", request.url));
      });
  }

  if(request.nextUrl.pathname.startsWith('/api/discovery/create')){
    const intermediateSession = request.cookies.get("intermediate_session")?.value;
    if (!intermediateSession) {
      return NextResponse.redirect("/discovery");
    }
    const { organization_name, require_mfa } = await request.json();

    try {
      const { member, organization, session_jwt, intermediate_session_token } =
        await stytch.discovery.organizations.create({
          intermediate_session_token: intermediateSession,
          email_allowed_domains: [],
          organization_slug: organization_name,
          organization_name: organization_name,
          session_duration_minutes: 60,
          mfa_policy: require_mfa ? "REQUIRED_FOR_ALL" : "OPTIONAL"
        });

      // Make the organization discoverable to other emails
      try {
        await stytch.organizations.update({
          organization_id: organization!.organization_id,
          email_jit_provisioning: "RESTRICTED",
          sso_jit_provisioning: "ALL_ALLOWED",
          email_allowed_domains: [toDomain(member.email_address)],
        });
      } catch (e) {
        throw e;
      }

      // Mark the first user in the organization as the admin
      await stytch.organizations.members.update({
        organization_id: organization!.organization_id,
        member_id: member.member_id,
        trusted_metadata: { admin: true },
      });

      if(session_jwt === "") {
        const response = NextResponse.redirect(new URL(`/${organization!.organization_slug}/smsmfa?sent=false&org_id=${organization!.organization_id}&member_id=${member.member_id}`, request.url));
        setIntermediateSession(response, intermediate_session_token)
        clearSession(response)
        return response;
      }
      const response = NextResponse.redirect(new URL(`/${organization!.organization_slug}/dashboard`, request.url));
      clearIntermediateSession(response);
      setSession(response, session_jwt);
      return response;
    } catch (error) {
      return NextResponse.redirect(new URL(`/discovery`, request.url));
    }
  }

  if(request.nextUrl.pathname.startsWith('/api/discovery/:orgId')){
    const discoverySessionData = getDiscoverySessionData(request.cookies.get('session')?.value, request.cookies.get('intermediate_session')?.value);
    if (discoverySessionData.error) {
      console.log("No session tokens found...");
      return { redirect: { statusCode: 307, destination: `/login` } };
    }
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    if (!orgId || Array.isArray(orgId)) {
      return NextResponse.redirect("/discovery");
    }

    const exchangeSession = () => {
      if (discoverySessionData.isDiscovery) {
        return stytch.discovery.intermediateSessions.exchange({
          intermediate_session_token: discoverySessionData.intermediateSession,
          organization_id: orgId,
          session_duration_minutes: 60,
        });
      }
      return stytch.sessions.exchange({
        organization_id: orgId,
        session_jwt: discoverySessionData.sessionJWT,
      });
    };

    try {
      const { session_jwt, organization, member, intermediate_session_token, mfa_required } = await exchangeSession();
      if(session_jwt === "") {
        const responseString = redirectToSMSMFA(organization, member, mfa_required!);
        const response = NextResponse.redirect(responseString)
        setIntermediateSession(response, intermediate_session_token)
        clearSession(response)
        return response;
      }
      const response = NextResponse.redirect(`/${organization.organization_slug}/dashboard`);
      setSession(response, session_jwt);
      clearIntermediateSession(response);
      return response;
    } catch (error) {
      return NextResponse.redirect("/discovery");
    }
  }

  if(request.nextUrl.pathname.startsWith('/logout')){
    const response = NextResponse.redirect("/");
    revokeSession(request, response);
    return response;
  }

  const sessionJWT = request.cookies.get("session");

  if (!sessionJWT) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const sessionAuthRes = await stytch.sessions.authenticate({
      session_duration_minutes: 30,
      session_jwt: sessionJWT.value,
    });
    return NextResponse.next().cookies.set('x-session', JSON.stringify(sessionAuthRes));
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
    matcher: ['/auth/[slug]/dashboard/:path*', '/api/callback', '/api/discovery/create', "/api/logout"],
}
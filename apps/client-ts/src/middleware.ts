import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import loadStytch, { Member, Organization, loadB2CStytch } from '@/lib/stytch/loadStytch';
import { clearIntermediateSession, clearSession, exchangeToken, getDiscoverySessionData, revokeSession, setIntermediateSession, setSession } from '@/lib/stytch/sessionService';
import { MfaRequired } from 'stytch';
import { toDomain } from '@/lib/utils';
import CONFIG from "@/lib/config";

const OAUTH_TOKEN = 'oauth';
const MAGIC_LINKS_TOKEN = 'magic_links';
const RESET_LOGIN = 'login';

const stytchB2C = loadB2CStytch();
const stytch = loadStytch();

function redirectToSMSMFA(organization: Organization, member: Member, mfa_required: MfaRequired | null ) {
  if(mfa_required != null && mfa_required.secondary_auth_initiated == "sms_otp") {
    // An OTP code is automatically sent if Stytch knows the member's phone number
    return `/${organization.organization_slug}/smsmfa?sent=true&org_id=${organization.organization_id}&member_id=${member.member_id}`;
  }
  return `/${organization.organization_slug}/smsmfa?sent=false&org_id=${organization.organization_id}&member_id=${member.member_id}`;
}


export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname == '/'){
    return NextResponse.redirect(new URL('/connections', request.url))
  }

  if(CONFIG.DISTRIBUTION !== "managed"){
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/callback')) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('slug');

    return exchangeToken(request)
      .then((exchangeResult) => {
        if (exchangeResult.kind === "login") {
          const response = NextResponse.redirect(new URL(`/auth/${query}/dashboard`, request.url));
          setSession(response, exchangeResult.token); // Set session using response cookies.
          return response;
        } else {
          const response = NextResponse.redirect(new URL(`/auth/discovery`, request.url));
          setIntermediateSession(response, exchangeResult.token); // Set intermediate session using response cookies.
          return response;
        }
      })
      .catch((error) => {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      });
  }

  if(request.nextUrl.pathname.startsWith('/api/discovery/start')){
    return NextResponse.next();
  }

  if(request.nextUrl.pathname.startsWith('/api/discovery/create')){
    const intermediateSession = request.cookies.get("intermediate_session")?.value;
    //console.log("intrm session => "+ intermediateSession);
    if (!intermediateSession) {
      return NextResponse.redirect(new URL("/auth/discovery", request.url));
    }
    const body = await request.text();
    const parts = body.split('=');
    const organization_name = parts[1];
    //console.log("organization_name => "+ organization_name)
    //const { organization_name, require_mfa } = body;
    try {
      const { member, organization, session_jwt, intermediate_session_token } =
        await stytch.discovery.organizations.create({
          intermediate_session_token: intermediateSession,
          email_allowed_domains: [],
          organization_slug: organization_name,
          organization_name: organization_name,
          session_duration_minutes: 60,
          mfa_policy: "OPTIONAL"
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
        const response = NextResponse.redirect(new URL(`/auth/${organization!.organization_slug}/smsmfa?sent=false&org_id=${organization!.organization_id}&member_id=${member.member_id}`, request.url));
        setIntermediateSession(response, intermediate_session_token)
        clearSession(response)
        return response;
      }
      const response = NextResponse.redirect(new URL(`/auth/${organization!.organization_slug}/dashboard`, request.url));
      clearIntermediateSession(response);
      setSession(response, session_jwt);
      return response;
    } catch (error) {
      return NextResponse.redirect(new URL(`/auth/discovery`, request.url));
    }
  }

  if(request.nextUrl.pathname.match(/^\/api\/discovery\/([^\/]+)$/)){
    const discoverySessionData = getDiscoverySessionData(request.cookies.get('session')?.value, request.cookies.get('intermediate_session')?.value);
    if (discoverySessionData.error) {
      console.log("No session tokens found...");
      return { redirect: { statusCode: 307, destination: `/auth/login` } };
    }
    const match = request.nextUrl.pathname.match(/^\/api\/discovery\/([^\/]+)$/);
    if(!match) return NextResponse.redirect(new URL("/auth/discovery", request.url));
    const orgId = match[1];
    console.log(orgId)
    if (!orgId || Array.isArray(orgId)) {
      return NextResponse.redirect(new URL("/auth/discovery", request.url));
    }
    if(discoverySessionData){
      //console.log(JSON.stringify("data : " + discoverySessionData))
    }
    const exchangeSession = async () => {
      if (discoverySessionData.isDiscovery) {
        return await stytch.discovery.intermediateSessions.exchange({
          intermediate_session_token: discoverySessionData.intermediateSession,
          organization_id: orgId,
          session_duration_minutes: 60,
        });
      }
      //console.log('one '+ orgId);
      //console.log('two '+ discoverySessionData.sessionJWT);
      const res = await stytch.sessions.exchange({
        organization_id: orgId,
        session_jwt: discoverySessionData.sessionJWT,
      });
      //console.log('res is '+ res);
      
      return res;
    };

    try {
      const { session_jwt, organization, member, intermediate_session_token, mfa_required } = await exchangeSession();
      //console.log(`DATA from exchange session: ${session_jwt} ${organization} ${member} ${intermediate_session_token} ${mfa_required}`)
      if(session_jwt === "") {
        const responseString = redirectToSMSMFA(organization, member, mfa_required!);
        //console.log(`response string: ${responseString}`)
        const response = NextResponse.redirect(new URL(responseString, request.url))
        setIntermediateSession(response, intermediate_session_token)
        clearSession(response)
        return response;
      }
      const response = NextResponse.redirect(new URL(`/auth/${organization.organization_slug}/dashboard`, request.url));
      setSession(response, session_jwt);
      clearIntermediateSession(response);
      return response;
    } catch (error) {
      //console.log("error inside org "+ error)
      return NextResponse.redirect(new URL('/auth/discovery', request.url));
    }
  }

  if(request.nextUrl.pathname.startsWith('/api/logout')){
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    revokeSession(request, response);
    return response;
  }
  
  const sessionJWT = request.cookies.get("stytch_session_jwt")?.value;
  console.log(sessionJWT)
  if (!sessionJWT) {
    return NextResponse.redirect(new URL("/b2c/login", request.url));
  }

  // loadStytch() is a helper function for initalizing the Stytch Backend SDK. See the function definition for more details.
  const stytchClient = loadB2CStytch();

  try {
    // Authenticate the session JWT. If an error is thrown the session authentication has failed.
    await stytchClient.sessions.authenticateJwt({session_jwt: sessionJWT});
    return NextResponse.next();
  } catch (e) {
    return NextResponse.redirect(new URL("/b2c/login", request.url));
  }

  /*const sessionJWT = request.cookies.get("session")?.value;

  if (!sessionJWT) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    let sessionAuthRes;
    try {
      sessionAuthRes = await stytch.sessions.authenticate({
        session_duration_minutes: 30, // extend the session a bit
        session_jwt: sessionJWT,
      });
    } catch (err) {
      console.error("Could not find member by session token", err);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    //console.log(sessionAuthRes);
    
    let response;
    if(request.nextUrl.pathname == '/profile'){
      response = NextResponse.redirect(new URL(`/auth/${sessionAuthRes.organization.organization_slug}/dashboard`, request.url));
    }else{
      response = NextResponse.next();
    }
    // Stytch issues a new JWT on every authenticate call - store it on the UA for faster validation next time
    setSession(response, sessionAuthRes.session_jwt);

    const isAdmin = sessionAuthRes.member.trusted_metadata!.admin as boolean;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    response.headers.set('x-member-org', sessionAuthRes.member.organization_id);
 
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: "Session invalid" }), { status: 401 });
  }  */
}

export const config = {
    matcher: [
      '/',
      '/profile',
      '/api-keys',
      '/connections',
      '/configuration',
      '/events',
      '/auth/[slug]/dashboard/:path*', 
      '/api/callback', 
      '/api/discovery/:path*', 
      '/api/logout', 
      '/api/delete_member',
      '/api/invite',
      '/api/sso/:path*'
    ],
}
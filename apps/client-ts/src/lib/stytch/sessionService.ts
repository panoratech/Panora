import { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import loadStytch, { Member, SessionsAuthenticateResponse } from "./loadStytch";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_DURATION_MINUTES = 60;
export const INTERMEDIATE_SESSION_DURATION_MINUTES = 10;

export const SESSION_SYMBOL = Symbol("session");
const SESSION_COOKIE = "session";
const INTERMEDIATE_SESSION_COOKIE = "intermediate_session";

const stytch = loadStytch();

type ExchangeResult = { kind: "discovery" | "login"; token: string; };

export async function exchangeToken(req: NextRequest): Promise<ExchangeResult> {
  const query = req.nextUrl.searchParams;
  if (
    query.get("stytch_token_type") === "multi_tenant_magic_links" &&
    query.get("token")
  ) {
    return await handleMagicLinkCallback(req);
  }

  if (query.get("stytch_token_type") === "sso" && query.get("token")) {
    return await handleSSOCallback(req);
  }

  if (query.get("stytch_token_type") === "discovery" && query.get("token")) {
    return await handleEmailMagicLinksDiscoveryCallback(req);
  }

  if (query.get("stytch_token_type") === "discovery_oauth" && query.get("token")) {
    return await handleOAuthDiscoveryCallback(req);
  }

  if (query.get("stytch_token_type") === "oauth" && query.get("token")) {
    return await handleOAuthCallback(req);
  }

  console.log("No token found in req.query", query.get("token"));
  throw Error("No token found");
}

async function handleMagicLinkCallback(
  req: NextRequest
): Promise<ExchangeResult> {
  const query = req.nextUrl.searchParams;
  const authRes = await stytch.magicLinks.authenticate({
    magic_links_token: query.get("token") as string,
    session_duration_minutes: SESSION_DURATION_MINUTES,
  });

  return {
    kind: "login",
    token: authRes.session_jwt as string,
  };
}

async function handleSSOCallback(req: NextRequest): Promise<ExchangeResult> {
  const query = req.nextUrl.searchParams;
  const authRes = await stytch.sso.authenticate({
    sso_token: query.get("token") as string,
    session_duration_minutes: SESSION_DURATION_MINUTES,
  });

  return {
    kind: "login",
    token: authRes.session_jwt as string,
  };
}

async function handleEmailMagicLinksDiscoveryCallback(
  req: NextRequest
): Promise<ExchangeResult> {
  const query = req.nextUrl.searchParams;
  const authRes = await stytch.magicLinks.discovery.authenticate({
    discovery_magic_links_token: query.get('token') as string,
  });

  return {
    kind: "discovery",
    token: authRes.intermediate_session_token as string,
  };
}

async function handleOAuthDiscoveryCallback(
    req: NextRequest
): Promise<ExchangeResult> {
  const query = req.nextUrl.searchParams;

  const authRes = await stytch.oauth.discovery.authenticate({
    discovery_oauth_token: query.get("token") as string,
  });

  return {
    kind: "discovery",
    token: authRes.intermediate_session_token as string,
  };
}

async function handleOAuthCallback(
    req: NextRequest
): Promise<ExchangeResult> {
  const query = req.nextUrl.searchParams;

  const authRes = await stytch.oauth.authenticate({
    oauth_token: query.get("token") as string,
    session_duration_minutes: SESSION_DURATION_MINUTES,
  });

  return {
    kind: "login",
    token: authRes.session_jwt as string,
  };
}

export function setSession(
  res: NextResponse,
  sessionJWT: string
) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionJWT,
    httpOnly: true,
    maxAge: 1000 * 60 * SESSION_DURATION_MINUTES, // minutes to milliseconds
  })
}

export function clearSession(
  res: NextResponse
) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0, // minutes to milliseconds
  })
}

export function setIntermediateSession(
  res: NextResponse,
  intermediateSessionToken: string
) {
  res.cookies.set({
    name: INTERMEDIATE_SESSION_COOKIE,
    value: intermediateSessionToken,
    httpOnly: true,
    maxAge: 1000 * 60 * INTERMEDIATE_SESSION_DURATION_MINUTES, // minutes to milliseconds
  })
}

export function clearIntermediateSession(
  res: NextResponse
) {
  res.cookies.set({
    name: INTERMEDIATE_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0, // minutes to milliseconds
  })
  
}

type DiscoverySessionData =
  | {
      sessionJWT: string;
      intermediateSession: undefined;
      isDiscovery: false;
      error: false;
    }
  | {
      sessionJWT: undefined;
      intermediateSession: string;
      isDiscovery: true;
      error: false;
    }
  | { error: true };

  export function getDiscoverySessionData(
    sessionCookie?: string,
    intermediateSessionCookie?: string
  ): DiscoverySessionData {
    if (sessionCookie) {
      return {
        sessionJWT: sessionCookie,
        intermediateSession: undefined,
        isDiscovery: false,
        error: false,
      };
    }
  
    if (intermediateSessionCookie) {
      return {
        sessionJWT: undefined,
        intermediateSession: intermediateSessionCookie,
        isDiscovery: true,
        error: false,
      };
    }
    return { error: true };
  }

type APIHandler = (
  member: Member,
  req: NextRequest,
  res: NextResponse
) => Promise<NextResponse | void>;

/**
 * adminOnlyAPIRoute wraps an API handler and ensures that the caller has a valid session
 * The caller's member object is passed to the API handler
 * @param apiHandler
 */
export function adminOnlyAPIRoute(apiHandler: APIHandler) {
  return async function WrappedHandler(
    req: NextRequest,
    res: NextResponse
  ): Promise<NextResponse | void> {
    const sessionJWT = req.cookies.get(SESSION_COOKIE)?.value;

    if (!sessionJWT) {
      console.log("No session JWT found...");
      return res.status(401).end();
    }

    console.log(sessionJWT);

    let sessionAuthRes;
    try {
      sessionAuthRes = await stytch.sessions.authenticate({
        session_duration_minutes: 30, // extend the session a bit
        session_jwt: sessionJWT,
      });
    } catch (err) {
      console.error("Could not find member by session token", err);
      return res.status(401).end();
    }

    console.log(sessionAuthRes);
    // Stytch issues a new JWT on every authenticate call - store it on the UA for faster validation next time
    setSession(res, sessionAuthRes.session_jwt);

    const isAdmin = sessionAuthRes.member.trusted_metadata!.admin as boolean;
    if (!isAdmin) {
      console.error("Member is not authorized to call route");
      return res.status(403).end();
    }

    return apiHandler(sessionAuthRes.member, req, res);
  };
}


/**
 * useAuth will return the authentication result for the logged-in user.
 * It can only be called in functions wrapped with {@link withSession}`
 * @param context
 */
export function getAuthData(
  header: string | null
): SessionsAuthenticateResponse {
  // @ts-ignore
  if (!header) {
    throw Error("useAuth called in route not protected by withSession");
  }
  // @ts-ignore
  return JSON.parse(header) as AuthenticateResponse;
}

export function revokeSession(req: NextRequest, res: NextResponse) {
  const sessionJWT = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionJWT) {
    return;
  }
  // Delete the session cookie by setting maxAge to 0
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0 });
  // Call Stytch in the background to terminate the session
  // But don't block on it!
  stytch.sessions
    .revoke({ session_jwt: sessionJWT })
    .then(() => {
      console.log("Session successfully revoked");
    })
    .catch((err) => {
      console.error("Could not revoke session", err);
    });
}

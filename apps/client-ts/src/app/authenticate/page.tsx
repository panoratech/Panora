"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStytchUser, useStytch } from "@stytch/nextjs";
import useProfile from "@/hooks/useProfile";
import useProfileMutation from "@/hooks/mutations/useProfileMutation";
//import useOrganisations from "@/hooks/useOrganisations";

const OAUTH_TOKEN = "oauth";
const MAGIC_LINKS_TOKEN = "magic_links";

/**
 * During both the Magic link and OAuth flows, Stytch will redirect the user back to your application to a specified redirect URL (see Login.tsx).
 * Stytch will append query parameters to the redirect URL which are then used to complete the authentication flow.
 * A redirect URL for this example app will look something like: http://localhost:3000/authenticate?stytch_token_type=magic_links&token=abc123
 *
 * The AuthenticatePage will detect the presence of a token in the query parameters, and attempt to authenticate it.
 * 
 * On successful authentication, a session will be created and the user will be redirect to /profile.
 */
const InnerAuthenticate = () => {
  const { user, isInitialized } = useStytchUser();
  const stytch = useStytch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useProfile(user?.user_id!);
  const { mutate } = useProfileMutation();
  //const { data: orgs, isLoading: isloadingOrganisations } = useOrganisations();

  useEffect(() => {
    if (stytch && !user && isInitialized) {
      const token = searchParams.get("token");
      const stytch_token_type = searchParams.get("stytch_token_type");

      if (token && stytch_token_type === OAUTH_TOKEN) {
        stytch.oauth.authenticate(token, {
          session_duration_minutes: 60,
        });
      } else if (token && stytch_token_type === MAGIC_LINKS_TOKEN) {
        stytch.magicLinks.authenticate(token, {
          session_duration_minutes: 60,
        });
      }
    }
  }, [isInitialized, router, searchParams, stytch, user]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (user) {
      if (!data) {
        mutate({
          first_name: user.name.first_name,
          last_name: user.name.last_name,
          email: user.emails[0].email,
          stytch_id_user: user.user_id,
          strategy: 'b2c',
          //id_organization: orgs && orgs[0].id_organization
        });
      }
      router.replace("/b2c/profile");
    }
  }, [router, user, isInitialized, data, mutate]);

  return null;
};

const Authenticate = () => {

  return (
    <Suspense>
      <InnerAuthenticate />
    </Suspense>
  )
}

export default Authenticate;
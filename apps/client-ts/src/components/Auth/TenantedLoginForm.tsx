"use client"

import { login } from "@/lib/stytch/api";
import {
    formatSSOStartURL,
    Organization,
} from "@/lib/stytch/loadStytch";
import { EmailLoginForm } from "./EmailLoginForm";
import {OAuthButton, OAuthProviders} from "./OAuthButton";
import { Card } from "../ui/card";

type Props = {
  org: Organization;
  domain: string;
};
const TenantedLoginForm = ({ org, domain }: Props) => {
    return (
    <Card className="p-4 m-4">
      <EmailLoginForm
        title={`Log in to ${org.organization_name}`}
        onSubmit={(email) => login(email, org.organization_id)}
      >
        {org.sso_default_connection_id && (
          <div>
            <h2>
              Or, use this organization&apos;s&nbsp;
              <a href={formatSSOStartURL(domain, org.sso_default_connection_id)}>
                Preferred Identity Provider
              </a>
            </h2>
            <br />
          </div>
        )}
      </EmailLoginForm>
        <OAuthButton providerType={OAuthProviders.Google} hostDomain={domain} orgSlug={org.organization_slug}/>
        <OAuthButton providerType={OAuthProviders.Microsoft} hostDomain={domain} orgSlug={org.organization_slug}/>
        {/*    Login with Google*/}
        {/*</Link>*/}
    </Card>
  );
};


export default TenantedLoginForm;

import {FormEventHandler, useState} from "react";
import {EmailLoginForm} from "../components/EmailLoginForm";
import {useStytchDiscoveryStartMutation} from "@/lib/stytch/api";
import {OAuthButton, OAuthProviders} from "../components/OAuthButton";
import { Link, useNavigate } from "react-router-dom";

const ContinueToTenantForm = ({ onBack }: { onBack: () => void }) => {
  const [slug, setSlug] = useState<string>("");
  const navigate = useNavigate();

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    navigate(`${slug}/login`);
  };

  return (
    <div>
      <h1>What is your Organization&apos;s Domain?</h1>
      <p>
        Don&apos;t know your organization&apos;s Domain? Find your{" "}
        <Link to="" onClick={onBack}>
          organizations
        </Link>
        .
      </p>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="acme-corp"
        />
        <button className="primary" id="button" type="submit" disabled={!slug}>
          Continue
        </button>
      </form>
    </div>
  );
};

type Props = { domain: string; };

const LoginForm = ({domain}: Props) => {
  const [isDiscovery, setIsDiscovery] = useState(true);
  
  const { mutate: discoveryStart } = useStytchDiscoveryStartMutation();
  
  const handleEmailSubmit = (email: string) => {
    discoveryStart({ email });
  };

  if (isDiscovery) {
    return (
      <>
        <EmailLoginForm title="Sign in" onSubmit={handleEmailSubmit}>
          <p>
            We&apos;ll email you a magic code for a password-free sign in.
            <br />
            You&apos;ll be able to choose which organization you want to access.
            <br />
            Or you can{" "}
            <Link to="" onClick={() => setIsDiscovery(false)}>
              sign in manually instead
            </Link>
            .
          </p>
        </EmailLoginForm>
        or
        <OAuthButton providerType={OAuthProviders.Google} hostDomain={domain} />
        <OAuthButton providerType={OAuthProviders.Microsoft} hostDomain={domain} />
      </>
    );
  } else {
    return <ContinueToTenantForm onBack={() => setIsDiscovery(true)} />;
  }
};

export default LoginForm;
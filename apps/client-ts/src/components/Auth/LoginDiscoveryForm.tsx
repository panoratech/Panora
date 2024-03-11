'use client';

import {FormEventHandler, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {EmailLoginForm} from "./EmailLoginForm";
import {discoveryStart} from "@/lib/stytch/api";
import {OAuthButton, OAuthProviders} from "./OAuthButton";
import { Input } from "@/components/ui/input"

const ContinueToTenantForm = ({ onBack }: { onBack: () => void }) => {
  const [slug, setSlug] = useState<string>("");
  const router = useRouter();

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    router.push(`${slug}/login`);
  };

  return (
    <div>
      <h1>What is your Organization&apos;s Domain?</h1>
      <p className="">
        Don&apos;t know your organization&apos;s Domain? 
      </p>
      <p className="">
      Login to find your{" "}
        <Link href="" className="underline" onClick={onBack}>
          organizations
        </Link>
      </p>
      <form onSubmit={onSubmit}>
        <Input
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

const LoginDiscoveryForm = ({domain}: Props) => {
  const [isDiscovery, setIsDiscovery] = useState(true);

  if (isDiscovery) {
    return (
      <>
        <EmailLoginForm title="Sign in" onSubmit={discoveryStart}>
          <p>
            We&apos;ll email you a magic code for a password-free sign in.
            <br />
            You&apos;ll be able to choose which organization you want to access.
            <br />
            Or you can{" "}
            <Link href="" className="underline" onClick={() => setIsDiscovery(false)}>
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

export default LoginDiscoveryForm;

'use client';

import {FormEventHandler, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {EmailLoginForm} from "./EmailLoginForm";
import {discoveryStart} from "@/lib/stytch/api";
import {OAuthButton, OAuthProviders} from "./OAuthButton";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

const ContinueToTenantForm = ({ onBack }: { onBack: () => void }) => {
  const [slug, setSlug] = useState<string>("");
  const router = useRouter();

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    router.push(`/auth/${slug}/login`);
  };

  return (
    <Card className="p-4">
      <h1 className="text-2xl font-bold">Enter your organization </h1>
      <p className="text-md font-semibold">
        Don&apos;t know your organization&apos;s Domain? 
      </p>
      <p className="text-md font-semibold">
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
          className="mt-4"
        />
        <Button className="primary" id="button" type="submit" disabled={!slug}>
          Continue
        </Button>
      </form>
    </Card>
  );
};

type Props = { domain: string; };

const LoginDiscoveryForm = ({domain}: Props) => {
  const [isDiscovery, setIsDiscovery] = useState(true);

  if (isDiscovery) {
    return (
      <>
        <EmailLoginForm title="Sign in" onSubmit={discoveryStart}>
          <p className="text-md font-semibold">
            We&apos;ll email you a magic code for a password-free sign in.
            <br />
            Or you can{" "}
            <Link href="" className="underline" onClick={() => setIsDiscovery(false)}>
              sign in manually instead
            </Link>
            .
          </p>
        </EmailLoginForm>
        <OAuthButton providerType={OAuthProviders.Google} hostDomain={domain} />
        <OAuthButton providerType={OAuthProviders.Microsoft} hostDomain={domain} />
      </>
    );
  } else {
    return <ContinueToTenantForm onBack={() => setIsDiscovery(true)} />;
  }
};

export default LoginDiscoveryForm;

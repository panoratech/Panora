'use client';

import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import { discoveryStart } from "@/lib/stytch/api";
import {OAuthButton, OAuthProviders} from "./OAuthButton";

const STATUS = {
  INIT: 0,
  SENT: 1,
  ERROR: 2,
};

const isValidEmail = (emailValue: string) => {
  // Overly simple email address regex
  const regex = /\S+@\S+\.\S+/;
  return regex.test(emailValue);
};

const isValidOrgName = (organizationName: string) => {
  return organizationName.length > 3;
};

type Props = { domain: string; };

const SignupForm = ({ domain }: Props) => {
  const [emlSent, setEMLSent] = useState(STATUS.INIT);
  const [email, setEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const isValid = isValidEmail(email);
    setIsDisabled(!isValid);
  }, [email]);

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value);
    if (isValidEmail(e.target.value)) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    // Disable button right away to prevent sending emails twice
    if (isDisabled) {
      return;
    } else {
      setIsDisabled(true);
    }

    if (isValidEmail(email)) {
      const resp = await discoveryStart(email);
      if (resp.status === 200) {
        setEMLSent(STATUS.SENT);
      } else {
        setEMLSent(STATUS.ERROR);
      }
    }
  };

  const handleTryAgain = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEMLSent(STATUS.INIT);
    // setEmail('');
    // setOrganizationName('');
  };

  return (
    <div className="card">
      {emlSent === STATUS.INIT && (
        <>
          <h1>Sign up</h1>
          <form onSubmit={onSubmit}>
            <label>Email address</label>
            <input
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <button
              className="primary"
              disabled={isDisabled}
              id="button"
              type="submit"
            >
              Continue
            </button>
          </form>
          or
          <OAuthButton providerType={OAuthProviders.Google} hostDomain={domain} />
          <OAuthButton providerType={OAuthProviders.Microsoft} hostDomain={domain} />
        </>
      )}
      {emlSent === STATUS.SENT && (
        <>
          <h1>Check your email</h1>
          <p>{`An email was sent to ${email}`}</p>
          <a className="link" onClick={handleTryAgain}>
            Click here to try again.
          </a>
        </>
      )}
      {emlSent === STATUS.ERROR && (
        <div>
          <h2>Something went wrong!</h2>
          <p>{`Failed to send email to ${email}`}</p>
          <a className="link" onClick={handleTryAgain}>
            Click here to try again.
          </a>
        </div>
      )}
    </div>
  );
};

export default SignupForm;

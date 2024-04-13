'use client';

import { StytchLogin } from '@stytch/nextjs';
import { StytchLoginConfig, OAuthProviders, Products, StyleConfig, StytchEvent, StytchError } from '@stytch/vanilla-js';
import { getDomainFromWindow } from '@/lib/stytch/urlUtils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';

const sdkStyle: StyleConfig = {
  fontFamily: '"Helvetica New", Helvetica, sans-serif',
  buttons: {
    primary: {
      backgroundColor: '#19303d',
      textColor: '#ffffff',
    },
  },
};

const sdkConfig: StytchLoginConfig = {
  products: [Products.emailMagicLinks],
  emailMagicLinksOptions: {
    loginRedirectURL: getDomainFromWindow() + '/authenticate',
    loginExpirationMinutes: 30,
    signupRedirectURL: getDomainFromWindow() + '/authenticate',
    signupExpirationMinutes: 30,
    createUserAsPending: false,
  }
};

const callbackConfig = {
  onEvent: (message: StytchEvent) => console.log(message),
  onError: (error: StytchError) => console.log(error),
}

const getOauthUrl = (provider: string) => {
  const isTest = process.env.NEXT_PUBLIC_STYTCH_PROJECT_ENV == 'test';
  const baseStytch = isTest ? "test" : "api"
  return `https://${baseStytch}.stytch.com/v1/public/oauth/${provider.toLowerCase()}/start?public_token=${process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN}`;
}

const LoginWithStytchSDKUI = () => {
  return (
    <>
      <div className='w-1'>
      <StytchLogin config={sdkConfig} styles={sdkStyle} callbacks={callbackConfig} />
      </div>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant={"outline"}
        onClick={() => {
          window.open(getOauthUrl("github"), '_blank');
        }}
        className='mb-2'
      >
        <Icons.gitHub className="mr-2 h-4 w-4" />{" "}
        Github
      </Button>
      <Button
        variant={"outline"}
        onClick={() => {
          window.open(getOauthUrl("google"), '_blank');
        }}
      >
        <Icons.google className="mr-2 h-4 w-4" />{" "}
        Google
      </Button>
    </>
  )
}

export default LoginWithStytchSDKUI;
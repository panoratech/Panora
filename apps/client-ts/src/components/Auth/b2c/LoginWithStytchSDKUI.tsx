'use client';

import { StytchLogin } from '@stytch/nextjs';
import { StytchLoginConfig, OAuthProviders, Products, StyleConfig, StytchEvent, StytchError } from '@stytch/vanilla-js';
import { getDomainFromWindow } from '@/lib/stytch/urlUtils';
import { Button } from '@/components/ui/button';

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

const LoginWithStytchSDKUI = () => {
  return (
    <>
    <div className='flex flex-row mb-2'>
      <a href='https://test.stytch.com/v1/public/oauth/google/start?public_token=public-token-test-1881250c-afb6-4c09-b284-95592cf2fd62' target='_blank'>
        <Button>Log In With Google</Button>
      </a>
      <a className='pl-3' href='https://test.stytch.com/v1/public/oauth/github/start?public_token=public-token-test-1881250c-afb6-4c09-b284-95592cf2fd62' target='_blank'>
        <Button>Log In With Github</Button>
      </a>
    </div>
    <StytchLogin config={sdkConfig} styles={sdkStyle} callbacks={callbackConfig} />
    </>
  )
}

export default LoginWithStytchSDKUI;
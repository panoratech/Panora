import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PostHogProvider} from 'posthog-js/react'
import config from './utils/config.ts'
import { StytchProvider } from '@stytch/react';
import { StytchHeadlessClient } from '@stytch/vanilla-js/headless';

const stytchClient = new StytchHeadlessClient(config.STYTCH_TOKEN);

const options = {
  api_host: config.POSTHOG_HOST,
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey={config.POSTHOG_KEY}
      options={options}
    >
      <StytchProvider stytch={stytchClient}>
        <App />
      </StytchProvider>
    </PostHogProvider>
  </React.StrictMode>,
)

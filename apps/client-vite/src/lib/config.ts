const config = {
    API_URL: import.meta.env.VITE_BACKEND_DOMAIN,
    MAGIC_LINK_DOMAIN: import.meta.env.VITE_MAGIC_LINK_DOMAIN,
    POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
    POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
    DISTRIBUTION: import.meta.env.VITE_DISTRIBUTION,
    STYTCH_TOKEN: import.meta.env.VITE_STYTCH_TOKEN
};
  
export default config;
  
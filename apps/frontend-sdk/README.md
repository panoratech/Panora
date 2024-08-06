
## Frontend SDK (React)

It is a React component aimed to be used in any of your pages so end-users can connect their 3rd parties in 1-click!

## Installation

```bash
npm i @panora/frontend-sdk
```

or

```bash
pnpm i @panora/frontend-sdk
```

or

```bash
yarn add @panora/frontend-sdk
```

## Use the component

```ts
    import { ConnectorCategory } from '@panora/shared'
    import Panora from '@panora/frontend-sdk'

    const panora = new Panora({ apiKey: 'YOUR_PRIVATE_API_KEY' });

    // kickstart the connection (OAuth, ApiKey, Basic)
    panora.connect({
      providerName: "hubspot",
      vertical: ConnectorCategory.Crm,
      linkedUserId: "4c6ca51b-7b23-4e3a-9309-24d2d331a04d",
    })
```

```ts
The Panora SDK must be instantiated with this type:

interface PanoraConfig { 
  apiKey: string;
  overrideApiUrl: string; 
  // Optional (only if you are in selfhost mode and want to use localhost:3000), by default: api.panora.dev
}

The .connect() function takes this type:

interface ConnectOptions {
  providerName: string;
  vertical: ConnectorCategory; // Must be imported from @panora/shared
  linkedUserId: string; // You can copy it from your Panora dahsbord under /configuration tab
  credentials?: Credentials; // Optional if you try to use OAuth
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    overrideReturnUrl?: string;
  }
}

By default, for OAuth we use Panora managed OAuth apps but if we dont have one registered OR you want to use your own, you must register that under /configuration tab from the webapp and it will automatically use these custom credentials !

interface Credentials {
  username?: string; // Used for Basic Auth
  password?: string; // Used for Basic Auth
  apiKey?: string; // Used for Api Key Auth
}

For Basic Auth some providers may only ask for username or password.

In this case just specify either password or username depending on the 3rd party reference.

```

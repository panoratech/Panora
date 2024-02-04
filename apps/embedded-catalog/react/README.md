
## Embedded Catalog of Providers (React)

It is a React component aimed to be used in any of your pages so end-users can connect their 3rd parties in 1-click !

![alt text](./showcase.png)

## Installation

```bash
npm i @panora/embedded-card-react
```

or

```bash
pnpm i @panora/embedded-card-react
```

or

```bash
yarn add @panora/embedded-card-react
```

## Import the component

```bash
# Import the css file
import "@panora/embedded-card-react/dist/index.css";

import PanoraProviderCard from "@panora/embedded-card-react";
```

## Use the component

```bash
    <PanoraProviderCard 
    name={"hubspot"} # name of the provider  
    projectId={"1"} # the project id tied to your organization
    returnUrl={""} # the url you want to redirect users to after the connection flow is successful
    linkedUserIdOrRemoteUserInfo={"1"}  # the linked id of the user if already created in Panora system or user's info in your system
    />
```

```ts
These are the types needed for the component.

interface RemoteUserInfo {
  userIdInYourSystem: string;
  companyName: string;
}

interface ProviderCardProp {
  name: string;
  projectId: string;
  returnUrl: string;
  linkedUserIdOrRemoteUserInfo: string | RemoteUserInfo;
}
```

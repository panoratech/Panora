
## Embedded Catalog of Providers (React)

It is a React component aimed to be used in any of your pages so end-users can connect their 3rd parties in 1-click!

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

## Import the components

```ts
import "@panora/embedded-card-react/dist/index.css";

import { PanoraDynamicCatalogCard, PanoraProviderCard } from '@panora/embedded-card-react';
```

## Use the component

- The `optionalApiUrl` is an optional prop to use the component with the self-hosted version of Panora.

```ts
    <PanoraProviderCard 
    name={"hubspot"} // name of the provider  
    projectId={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"} // Copy it from your dahshboard
    linkedUserId={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"}  // You can copy it from your Panora dahsbord under /configuration tab
    optionalApiUrl={"http://localhost:3000"} // Optional (only if you are in selfhost mode and want to use localhost:3000), by default: api.panora.dev
    />

    <PanoraDynamicCatalogCard
      category={ConnectorCategory.Crm} 
      projectId={"f9e9601e-d6da-471a-9777-94257e9b4f00"} 
      linkedUserId={"4c6ca51b-7b23-4e3a-9309-24d2d331a04d"} 
      optionalApiUrl="http://localhost:3000"
    />
```

```ts
These are the types needed for the components.

The `<PanoraProviderCard />` takes this props type:

interface ProviderCardProp {
  name: string;
  projectId: string;
  linkedUserId: string;
}

The `<PanoraDynamicCatalogCard />` takes this props type:

interface DynamicCardProp {
  projectId: string;
  linkedUserId: string;
  category?: ConnectorCategory;
  optionalApiUrl?: string,
}
```

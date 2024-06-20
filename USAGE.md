<!-- Start SDK Example Usage [usage] -->
```typescript
import { SDK } from "openapi";

const sdk = new SDK({
    jwt: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
    const result = await sdk.getHello();

    // Handle the result
    console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->
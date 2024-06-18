<div align="center">
  <h1> Panora </h1>
  <p> Open-Source Unified API </p>
</div>

![Hero](https://panora.dev/wp-content/uploads/2023/12/github-banner.png)

<div align="center">
  </br>
    <img alt="Discord" src="https://img.shields.io/discord/1038131193067077642"></img>
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/panoratech/panora?logo=github"> </img>
    <img alt="GitHub License" src="https://img.shields.io/github/license/panoratech/Panora"></img>
    <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/panoradotdev"></img>
    <img src="https://snyk.io/test/github/panoratech/Panora/badge.svg" alt="Known Vulnerabilities"></img>
  </br>
  
  <p>
    <a href="https://panora.dev">Website 🌎</a> - <a href="https://docs.panora.dev">Documentation 📖</a> - <a href="https://status.panora.dev">Status 🟢</a>
  </p>
</div>

### Have you met anyone who loves developing integrations? *No.* That’s why we designed an easy developer experience that you’ll enjoy

- **Simple developer experience:** easy to self-host, uses industry-standard data models, and is extensible
- **Builder-friendly terms:** Panora is open-source, and offers generous tips for contributors

### More than a devtool: Panora helps you put your product at the core of your customer's daily workflows

Your customers expect all of their tools to work well together. Panora avoids your team spending hundreds of hours building and maintaining integrations instead of your core product.

# ✨ Core Features  

|                    |
|---------------------------|
| **Magic Links:** Let your users grant you access to their data. Without writing code.              |
| **Custom Fields:** Reflect in Panora the specific data points that matter to your users            |
| **Passthrough Requests:** Interact with other software platforms in their native format.      |
| **Webhooks:** Listen to one webhook to receive normalized data from various software platforms                  |

# ✨ Integrations Catalog

Panora supports integration with the following objects across multiple platforms:

### CRM

|                                               | Contacts | Deals | Notes | Engagements | Tasks | Users | Companies |
|-----------------------------------------------|:--------:|:-----:|:-----:|:-----------:|:-----:|:-----:|:---------:|
| Hubspot           |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           |
| Pipedrive       |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           |
| Zoho CRM          |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           |
| Zendesk Sell |    ✔️    |   ✔️  |   ✔️  |      ✔️     |   ✔️  |   ✔️  |           |
| Attio                   |    ✔️    |       |       |             |       |       |     ✔️    |

### Ticketing

|             | Tickets | Comments | Users | Contacts | Accounts | Tags | Teams | Collections |
|-------------|:----------:|:-------:|:-------:|:------------:|:-------:|:-------:|:------:|:-------------:|
| Zendesk     | ✔        | ✔     | ✔    | ✔          | ✔    | ✔    | ✔ |  |
| Front       | ✔        | ✔     | ✔    | ✔          | ✔    | ✔    | ✔ |  |
| Jira        | ✔        | ✔     | ✔    |            |      | ✔    | ✔ | ✔ |
| Gorgias     | ✔        | ✔     | ✔    | ✔          |      | ✔    | ✔ |  |

Your favourite software is missing? [Ask the community to build a connector!](https://github.com/panoratech/Panora/issues/new)

# 🕹️ Try the Open-Source version

- Prerequisite: You should have Git and Docker installed

 1. Get the code

```
  git clone https://github.com/panoratech/Panora.git
 ```

 2. Go to Panora folder

```
  cd Panora && cp .env.example .env
  ```

 3. Start

```
  docker compose up
 ```

Visit our [Quickstart Guide](https://docs.panora.dev/quick-start) to start adding integrations to your product

# 🤔 Questions? Ask the core team

<a href="https://cal.com/rflih/30?utm_source=github&utm_campaign=readme"><img alt="Book us with Cal.com" src="https://cal.com/book-with-cal-dark.svg" /></a>

# 🚀 Contributors

<a href="https://github.com/panoratech/Panora/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=panoratech/Panora" />
</a>

Want to contribute? Visit our [guide](https://docs.panora.dev/open-source/contributors#setup-your-environnement) or check our detailed integrations guide [here.](https://github.com/panoratech/Panora/blob/main/INTEGRATIONS.md)

Our [guidelines.](https://github.com/panoratech/Panora/blob/main/CONTRIBUTING.md)

<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=3be49a98-8805-45ca-bd15-99f5321ec235" />

<!-- No SDK Installation -->
<!-- No SDK Example Usage -->
<!-- No SDK Available Operations -->
<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start Error Handling [errors] -->
## Error Handling

All SDK methods return a response object or throw an error. If Error objects are specified in your OpenAPI Spec, the SDK will throw the appropriate Error type.

| Error Object    | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.SDKError | 4xx-5xx         | */*             |

Validation errors can also occur when either method arguments or data returned from the server do not match the expected format. The `SDKValidationError` that is thrown as a result will capture the raw value that failed validation in an attribute called `rawValue`. Additionally, a `pretty()` method is available on this error that can be used to log a nicely formatted string since validation errors can list many issues and the plain error string may be difficult read when debugging. 


```typescript
import { SDK } from "openapi";
import * as errors from "openapi/models/errors";

const sdk = new SDK({
    jwt: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
    let result;
    try {
        result = await sdk.getHello();
    } catch (err) {
        switch (true) {
            case err instanceof errors.SDKValidationError: {
                // Validation errors can be pretty-printed
                console.error(err.pretty());
                // Raw value may also be inspected
                console.error(err.rawValue);
                return;
            }
            default: {
                throw err;
            }
        }
    }

    // Handle the result
    console.log(result);
}

run();

```
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Select Server by Index

You can override the default server globally by passing a server index to the `serverIdx` optional parameter when initializing the SDK client instance. The selected server will then be used as the default on the operations that use it. This table lists the indexes associated with the available servers:

| # | Server | Variables |
| - | ------ | --------- |
| 0 | `https://api.panora.dev` | None |
| 1 | `https://api-sandbox.panora.dev` | None |

```typescript
import { SDK } from "openapi";

const sdk = new SDK({
    serverIdx: 1,
    jwt: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
    const result = await sdk.getHello();

    // Handle the result
    console.log(result);
}

run();

```


### Override Server URL Per-Client

The default server can also be overridden globally by passing a URL to the `serverURL` optional parameter when initializing the SDK client instance. For example:

```typescript
import { SDK } from "openapi";

const sdk = new SDK({
    serverURL: "https://api.panora.dev",
    jwt: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
    const result = await sdk.getHello();

    // Handle the result
    console.log(result);
}

run();

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to use the `"beforeRequest"` hook to to add a
custom header and a timeout to requests and how to use the `"requestError"` hook
to log errors:

```typescript
import { SDK } from "openapi";
import { HTTPClient } from "openapi/lib/http";

const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: (request) => {
    return fetch(request);
  }
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new SDK({ httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security scheme globally:

| Name        | Type        | Scheme      |
| ----------- | ----------- | ----------- |
| `jwt`       | http        | HTTP Bearer |

To authenticate with the API the `jwt` parameter must be set when initializing the SDK client instance. For example:
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
<!-- End Authentication [security] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->



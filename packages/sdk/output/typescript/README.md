# Testsdk Typescript SDK 1.0.0
The Typescript SDK for Testsdk.
- API version: 1.0.0
- SDK version: 1.0.0
## Table of Contents
- [About the API](#requirements)
- [Installation](#installation)
- [Authentication](#authentication)
    - [Access Token](#access-token)
- [API Endpoint Services](#api-endpoint-services)
- [API Models](#api-models)
- [Sample Usage](#sample-usage)
- [Testsdk Services](#testsdk-services)
- [License](#license)
## About the API
The Panora API description
## Installation
```sh
npm install testsdk  
```
## Authentication
To see whether an endpoint needs a specific type of authentication check the endpoint's documentation.
### Access Token
The Testsdk API uses access tokens as a form of authentication. You can set the access token when initializing the SDK through the constructor:
```
const sdk = new Testsdk('YOUR_ACCESS_TOKEN')
```
Or through the `setAccessToken` method:
```
const sdk = new Testsdk()
sdk.setAccessToken('YOUR_ACCESS_TOKEN')
```
You can also set it for each service individually:
```
const sdk = new Testsdk()
sdk.main.setAccessToken('YOUR_ACCESS_TOKEN')
```
## Sample Usage
Here is a simple program demonstrating usage of this SDK. It can also be found in the `examples/src/index.ts` file in this directory.

When running the sample make sure to use `npm install` to install all the dependencies.

```Typescript
import { Testsdk } from 'testsdk';


const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.main
    .appControllerGetHello();
  console.log(result);
})();
 

```
# Testsdk Services
A list of all services and services methods.
- Services

    - [Main](#main)

    - [Auth](#auth)

    - [Connections](#connections)

    - [Webhook](#webhook)

    - [LinkedUsers](#linkedusers)

    - [Organisations](#organisations)

    - [Projects](#projects)

    - [FieldMapping](#fieldmapping)

    - [Events](#events)

    - [MagicLink](#magiclink)

    - [Passthrough](#passthrough)

    - [CrmContact](#crmcontact)
- [All Methods](#all-methods)


## Main

| Method    | Description|
| :-------- | :----------|
| [appControllerGetHello](#appcontrollergethello) |  |


## Auth

| Method    | Description|
| :-------- | :----------|
| [authControllerRegisterUser](#authcontrollerregisteruser) |  |
| [authControllerLogin](#authcontrollerlogin) |  |
| [authControllerUsers](#authcontrollerusers) |  |
| [authControllerApiKeys](#authcontrollerapikeys) |  |
| [authControllerGenerateApiKey](#authcontrollergenerateapikey) |  |


## Connections

| Method    | Description|
| :-------- | :----------|
| [connectionsControllerHandleCallback](#connectionscontrollerhandlecallback) |  |
| [connectionsControllerGetConnections](#connectionscontrollergetconnections) |  |


## Webhook

| Method    | Description|
| :-------- | :----------|
| [webhookControllerAddWebhook](#webhookcontrolleraddwebhook) |  |
| [webhookControllerGetWebhooks](#webhookcontrollergetwebhooks) |  |
| [webhookControllerUpdateWebhookStatus](#webhookcontrollerupdatewebhookstatus) |  |


## LinkedUsers

| Method    | Description|
| :-------- | :----------|
| [linkedUsersControllerAddLinkedUser](#linkeduserscontrolleraddlinkeduser) |  |
| [linkedUsersControllerGetLinkedUsers](#linkeduserscontrollergetlinkedusers) |  |
| [linkedUsersControllerGetLinkedUser](#linkeduserscontrollergetlinkeduser) |  |


## Organisations

| Method    | Description|
| :-------- | :----------|
| [organisationsControllerGetOragnisations](#organisationscontrollergetoragnisations) |  |
| [organisationsControllerCreateOrg](#organisationscontrollercreateorg) |  |


## Projects

| Method    | Description|
| :-------- | :----------|
| [projectsControllerGetProjects](#projectscontrollergetprojects) |  |
| [projectsControllerCreateProject](#projectscontrollercreateproject) |  |


## FieldMapping

| Method    | Description|
| :-------- | :----------|
| [fieldMappingControllerGetEntities](#fieldmappingcontrollergetentities) |  |
| [fieldMappingControllerGetAttributes](#fieldmappingcontrollergetattributes) |  |
| [fieldMappingControllerGetValues](#fieldmappingcontrollergetvalues) |  |
| [fieldMappingControllerDefineTargetField](#fieldmappingcontrollerdefinetargetfield) |  |
| [fieldMappingControllerMapFieldToProvider](#fieldmappingcontrollermapfieldtoprovider) |  |
| [fieldMappingControllerGetCustomProperties](#fieldmappingcontrollergetcustomproperties) |  |


## Events

| Method    | Description|
| :-------- | :----------|
| [eventsControllerGetEvents](#eventscontrollergetevents) |  |


## MagicLink

| Method    | Description|
| :-------- | :----------|
| [magicLinkControllerCreateLink](#magiclinkcontrollercreatelink) |  |
| [magicLinkControllerGetMagicLinks](#magiclinkcontrollergetmagiclinks) |  |
| [magicLinkControllerGetMagicLink](#magiclinkcontrollergetmagiclink) |  |


## Passthrough

| Method    | Description|
| :-------- | :----------|
| [passthroughControllerPassthroughRequest](#passthroughcontrollerpassthroughrequest) |  |


## CrmContact

| Method    | Description|
| :-------- | :----------|
| [contactControllerAddContacts](#contactcontrolleraddcontacts) |  |
| [contactControllerGetContacts](#contactcontrollergetcontacts) |  |
| [contactControllerUpdateContact](#contactcontrollerupdatecontact) |  |
| [contactControllerGetContact](#contactcontrollergetcontact) |  |




## All Methods


### **appControllerGetHello**

- HTTP Method: GET
- Endpoint: /




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.main.appControllerGetHello();
  console.log(result);
})();

```


### **authControllerRegisterUser**

- HTTP Method: POST
- Endpoint: /auth/register

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {
    email: 'email',
    first_name: 'first_name',
    last_name: 'last_name',
    password_hash: 'password_hash',
  };
  const result = await sdk.auth.authControllerRegisterUser(input);
  console.log(result);
})();

```

### **authControllerLogin**

- HTTP Method: POST
- Endpoint: /auth/login

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = { email: 'email', id_user: 'id_user', password_hash: 'password_hash' };
  const result = await sdk.auth.authControllerLogin(input);
  console.log(result);
})();

```

### **authControllerUsers**

- HTTP Method: GET
- Endpoint: /auth/users




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.auth.authControllerUsers();
  console.log(result);
})();

```

### **authControllerApiKeys**

- HTTP Method: GET
- Endpoint: /auth/api-keys




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.auth.authControllerApiKeys();
  console.log(result);
})();

```

### **authControllerGenerateApiKey**

- HTTP Method: POST
- Endpoint: /auth/generate-apikey

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {};
  const result = await sdk.auth.authControllerGenerateApiKey(input);
  console.log(result);
})();

```


### **connectionsControllerHandleCallback**

- HTTP Method: GET
- Endpoint: /connections/oauth/callback

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| state | string |  |
| code | string |  |
| location | string |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.connections.connectionsControllerHandleCallback(
    'state',
    'code',
    'location',
  );
  console.log(result);
})();

```

### **connectionsControllerGetConnections**

- HTTP Method: GET
- Endpoint: /connections




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.connections.connectionsControllerGetConnections();
  console.log(result);
})();

```


### **webhookControllerAddWebhook**

- HTTP Method: POST
- Endpoint: /webhook

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {
    description: 'description',
    id_project: 'id_project',
    scope: 'scope',
    url: 'url',
  };
  const result = await sdk.webhook.webhookControllerAddWebhook(input);
  console.log(result);
})();

```

### **webhookControllerGetWebhooks**

- HTTP Method: GET
- Endpoint: /webhook




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.webhook.webhookControllerGetWebhooks();
  console.log(result);
})();

```

### **webhookControllerUpdateWebhookStatus**

- HTTP Method: PUT
- Endpoint: /webhook/{id}

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| id | string |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.webhook.webhookControllerUpdateWebhookStatus('id');
  console.log(result);
})();

```


### **linkedUsersControllerAddLinkedUser**

- HTTP Method: POST
- Endpoint: /linked-users/create

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {
    alias: 'alias',
    id_project: 'id_project',
    linked_user_origin_id: 'linked_user_origin_id',
  };
  const result = await sdk.linkedUsers.linkedUsersControllerAddLinkedUser(input);
  console.log(result);
})();

```

### **linkedUsersControllerGetLinkedUsers**

- HTTP Method: GET
- Endpoint: /linked-users




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.linkedUsers.linkedUsersControllerGetLinkedUsers();
  console.log(result);
})();

```

### **linkedUsersControllerGetLinkedUser**

- HTTP Method: GET
- Endpoint: /linked-users/single

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| id | string |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.linkedUsers.linkedUsersControllerGetLinkedUser('id');
  console.log(result);
})();

```


### **organisationsControllerGetOragnisations**

- HTTP Method: GET
- Endpoint: /organisations




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.organisations.organisationsControllerGetOragnisations();
  console.log(result);
})();

```

### **organisationsControllerCreateOrg**

- HTTP Method: POST
- Endpoint: /organisations/create

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = { name: 'name', stripe_customer_id: 'stripe_customer_id' };
  const result = await sdk.organisations.organisationsControllerCreateOrg(input);
  console.log(result);
})();

```


### **projectsControllerGetProjects**

- HTTP Method: GET
- Endpoint: /projects




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.projects.projectsControllerGetProjects();
  console.log(result);
})();

```

### **projectsControllerCreateProject**

- HTTP Method: POST
- Endpoint: /projects/create

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = { id_organization: 'id_organization', name: 'name' };
  const result = await sdk.projects.projectsControllerCreateProject(input);
  console.log(result);
})();

```


### **fieldMappingControllerGetEntities**

- HTTP Method: GET
- Endpoint: /field-mapping/entities




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.fieldMapping.fieldMappingControllerGetEntities();
  console.log(result);
})();

```

### **fieldMappingControllerGetAttributes**

- HTTP Method: GET
- Endpoint: /field-mapping/attribute




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.fieldMapping.fieldMappingControllerGetAttributes();
  console.log(result);
})();

```

### **fieldMappingControllerGetValues**

- HTTP Method: GET
- Endpoint: /field-mapping/value




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.fieldMapping.fieldMappingControllerGetValues();
  console.log(result);
})();

```

### **fieldMappingControllerDefineTargetField**

- HTTP Method: POST
- Endpoint: /field-mapping/define

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {
    data_type: 'data_type',
    description: 'description',
    name: 'name',
    object_type_owner: {},
  };
  const result = await sdk.fieldMapping.fieldMappingControllerDefineTargetField(input);
  console.log(result);
})();

```

### **fieldMappingControllerMapFieldToProvider**

- HTTP Method: POST
- Endpoint: /field-mapping/map

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {
    attributeId: 'attributeId',
    linked_user_id: 'linked_user_id',
    source_custom_field_id: 'source_custom_field_id',
    source_provider: 'source_provider',
  };
  const result = await sdk.fieldMapping.fieldMappingControllerMapFieldToProvider(input);
  console.log(result);
})();

```

### **fieldMappingControllerGetCustomProperties**

- HTTP Method: GET
- Endpoint: /field-mapping/properties

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| linkedUserId | string |  |
| providerId | string |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.fieldMapping.fieldMappingControllerGetCustomProperties(
    'linkedUserId',
    'providerId',
  );
  console.log(result);
})();

```


### **eventsControllerGetEvents**

- HTTP Method: GET
- Endpoint: /events




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.events.eventsControllerGetEvents();
  console.log(result);
})();

```


### **magicLinkControllerCreateLink**

- HTTP Method: POST
- Endpoint: /magic-link/create

**Required Parameters**

| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {
    alias: 'alias',
    email: 'email',
    id_project: 'id_project',
    linked_user_origin_id: 'linked_user_origin_id',
  };
  const result = await sdk.magicLink.magicLinkControllerCreateLink(input);
  console.log(result);
})();

```

### **magicLinkControllerGetMagicLinks**

- HTTP Method: GET
- Endpoint: /magic-link




**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.magicLink.magicLinkControllerGetMagicLinks();
  console.log(result);
})();

```

### **magicLinkControllerGetMagicLink**

- HTTP Method: GET
- Endpoint: /magic-link/single

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| id | string |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.magicLink.magicLinkControllerGetMagicLink('id');
  console.log(result);
})();

```


### **passthroughControllerPassthroughRequest**

- HTTP Method: POST
- Endpoint: /passthrough

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| integrationId | string |  |
| linkedUserId | string |  |
| input | object | Request body. |



**Return Type**

PassThroughResponse

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = { data: {}, headers_: {}, method: 'GET', path: 'path' };
  const result = await sdk.passthrough.passthroughControllerPassthroughRequest(
    input,
    'integrationId',
    'linkedUserId',
  );
  console.log(result);
})();

```


### **contactControllerAddContacts**

- HTTP Method: POST
- Endpoint: /crm/contact

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| integrationId | string |  |
| linkedUserId | string |  |
| input | object | Request body. |

**Optional Parameters**

Optional parameters are passed as part of the last parameter to the method. Ex. {optionalParam1 : 'value1', optionalParam2: 'value2'}

| Name    | Type| Description |
| :-------- | :----------| :----------|
| remoteData | boolean |  |


**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = [{}, {}];
  const result = await sdk.crmContact.contactControllerAddContacts(
    input,
    'integrationId',
    'linkedUserId',
    { remoteData: true },
  );
  console.log(result);
})();

```

### **contactControllerGetContacts**

- HTTP Method: GET
- Endpoint: /crm/contact

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| integrationId | string |  |
| linkedUserId | string |  |

**Optional Parameters**

Optional parameters are passed as part of the last parameter to the method. Ex. {optionalParam1 : 'value1', optionalParam2: 'value2'}

| Name    | Type| Description |
| :-------- | :----------| :----------|
| remoteData | boolean |  |


**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.crmContact.contactControllerGetContacts(
    'integrationId',
    'linkedUserId',
    { remoteData: true },
  );
  console.log(result);
})();

```

### **contactControllerUpdateContact**

- HTTP Method: PATCH
- Endpoint: /crm/contact

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| id | string |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.crmContact.contactControllerUpdateContact('id');
  console.log(result);
})();

```

### **contactControllerGetContact**

- HTTP Method: GET
- Endpoint: /crm/contact/{id}

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| id | string |  |

**Optional Parameters**

Optional parameters are passed as part of the last parameter to the method. Ex. {optionalParam1 : 'value1', optionalParam2: 'value2'}

| Name    | Type| Description |
| :-------- | :----------| :----------|
| remoteData | boolean |  |


**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.crmContact.contactControllerGetContact('id', { remoteData: true });
  console.log(result);
})();

```




## License
License: MIT. See license in LICENSE.


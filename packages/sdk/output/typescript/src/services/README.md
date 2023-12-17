# Testsdk Services
A list of all services and services methods.
- Services

    - [Main](#main)

    - [Passthrough](#passthrough)

    - [MagicLink](#magiclink)

    - [Events](#events)

    - [FieldMapping](#fieldmapping)

    - [LinkedUsers](#linkedusers)

    - [Organisations](#organisations)

    - [Projects](#projects)

    - [CrmContact](#crmcontact)

    - [Auth](#auth)

    - [Connections](#connections)
- [All Methods](#all-methods)


## Main

| Method    | Description|
| :-------- | :----------|
| [appControllerGetHello](#appcontrollergethello) |  |


## Passthrough

| Method    | Description|
| :-------- | :----------|
| [passthroughControllerPassthroughRequest](#passthroughcontrollerpassthroughrequest) |  |


## MagicLink

| Method    | Description|
| :-------- | :----------|
| [magicLinkControllerCreateLink](#magiclinkcontrollercreatelink) |  |
| [magicLinkControllerGetMagicLinks](#magiclinkcontrollergetmagiclinks) |  |
| [magicLinkControllerGetMagicLink](#magiclinkcontrollergetmagiclink) |  |


## Events

| Method    | Description|
| :-------- | :----------|
| [eventsControllerGetEvents](#eventscontrollergetevents) |  |


## FieldMapping

| Method    | Description|
| :-------- | :----------|
| [fieldMappingControllerGetEntities](#fieldmappingcontrollergetentities) |  |
| [fieldMappingControllerGetAttributes](#fieldmappingcontrollergetattributes) |  |
| [fieldMappingControllerGetValues](#fieldmappingcontrollergetvalues) |  |
| [fieldMappingControllerDefineTargetField](#fieldmappingcontrollerdefinetargetfield) |  |
| [fieldMappingControllerMapFieldToProvider](#fieldmappingcontrollermapfieldtoprovider) |  |


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


## CrmContact

| Method    | Description|
| :-------- | :----------|
| [contactControllerGetCustomProperties](#contactcontrollergetcustomproperties) |  |
| [contactControllerAddContacts](#contactcontrolleraddcontacts) |  |
| [contactControllerGetContacts](#contactcontrollergetcontacts) |  |
| [contactControllerUpdateContact](#contactcontrollerupdatecontact) |  |
| [contactControllerSyncContacts](#contactcontrollersynccontacts) |  |


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


### **contactControllerGetCustomProperties**

- HTTP Method: GET
- Endpoint: /crm/contact/properties

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
  const result = await sdk.crmContact.contactControllerGetCustomProperties(
    'linkedUserId',
    'providerId',
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
| remoteData | boolean |  |
| input | object | Request body. |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const input = {};
  const result = await sdk.crmContact.contactControllerAddContacts(
    input,
    'integrationId',
    'linkedUserId',
    true,
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
    true,
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

### **contactControllerSyncContacts**

- HTTP Method: GET
- Endpoint: /crm/contact/sync

**Required Parameters**

| Name    | Type| Description |
| :-------- | :----------| :----------|
| integrationId | string |  |
| linkedUserId | string |  |
| remoteData | boolean |  |



**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Typescript
import { Testsdk } from './src';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.crmContact.contactControllerSyncContacts(
    'integrationId',
    'linkedUserId',
    true,
  );
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
  const input = { email: 'email', id_user: 58728004.68921766, password_hash: 'password_hash' };
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





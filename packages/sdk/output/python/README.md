# Testsdk Python SDK 1.0.0
A Python SDK for Testsdk.

The Panora API description

- API version: 1.0.0
- SDK version: 1.0.0

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
    - [Dependencies](#dependencies)
- [Authentication](#authentication)
    - [Access Token Authentication](#bearer-authentication)
- [API Endpoint Services](#api-endpoint-services)
- [API Models](#api-models)
- [Testing](#testing)
- [Configuration](#configuration)
- [Sample Usage](#sample-usage)
- [Testsdk Services](#testsdk-services)
- [License](#license)

## Installation
```bash
pip install testsdk
```

### Dependencies

This SDK uses the following dependencies:
- requests 2.28.1
- http-exceptions 0.2.10
- pytest 7.1.2
- responses 0.21.0

## Authentication

To see whether an endpoint needs a specific type of authentication check the endpoint's documentation.

### Access Token Authentication
The Testsdk API uses bearer tokens as a form of authentication.You can set the bearer token when initializing the SDK through the constructor: 

```py
sdk = Testsdk('YOUR_BEARER_TOKEN')
```

Or through the `set_access_token` method:
```py
sdk = Testsdk()
sdk.set_access_token('YOUR_BEARER_TOKEN')
```

You can also set it for each service individually:
```py
sdk = Testsdk()
sdk.main.set_access_token('YOUR_BEARER_TOKEN')
```

## API Endpoint Services

All URIs are relative to http://api.example.com.

Click the service name for a full list of the service methods.

| Service |
| :------ |
|[Main](./services/README.md#main)|
|[Passthrough](./services/README.md#passthrough)|
|[MagicLink](./services/README.md#magiclink)|
|[Events](./services/README.md#events)|
|[FieldMapping](./services/README.md#fieldmapping)|
|[LinkedUsers](./services/README.md#linkedusers)|
|[Organisations](./services/README.md#organisations)|
|[Projects](./services/README.md#projects)|
|[CrmContact](./services/README.md#crmcontact)|
|[Auth](./services/README.md#auth)|
|[Connections](./services/README.md#connections)|

## API Models
[A list documenting all API models for this SDK](./models/README.md#testsdk-models).

## Testing

Run unit tests with this command:

```sh
python -m unittest discover -p "test*.py" 
```

## Sample Usage

```py
from os import getenv
from pprint import pprint
from testsdk import Testsdk

sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))

results = sdk.main.app_controller_get_hello()

pprint(vars(results))
```


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
| [app_controller_get_hello](#app_controller_get_hello) |  |


## Passthrough

| Method    | Description|
| :-------- | :----------| 
| [passthrough_controller_passthrough_request](#passthrough_controller_passthrough_request) |  |


## MagicLink

| Method    | Description|
| :-------- | :----------| 
| [magic_link_controller_create_link](#magic_link_controller_create_link) |  |
| [magic_link_controller_get_magic_links](#magic_link_controller_get_magic_links) |  |
| [magic_link_controller_get_magic_link](#magic_link_controller_get_magic_link) |  |


## Events

| Method    | Description|
| :-------- | :----------| 
| [events_controller_get_events](#events_controller_get_events) |  |


## FieldMapping

| Method    | Description|
| :-------- | :----------| 
| [field_mapping_controller_get_entities](#field_mapping_controller_get_entities) |  |
| [field_mapping_controller_get_attributes](#field_mapping_controller_get_attributes) |  |
| [field_mapping_controller_get_values](#field_mapping_controller_get_values) |  |
| [field_mapping_controller_define_target_field](#field_mapping_controller_define_target_field) |  |
| [field_mapping_controller_map_field_to_provider](#field_mapping_controller_map_field_to_provider) |  |


## LinkedUsers

| Method    | Description|
| :-------- | :----------| 
| [linked_users_controller_add_linked_user](#linked_users_controller_add_linked_user) |  |
| [linked_users_controller_get_linked_users](#linked_users_controller_get_linked_users) |  |
| [linked_users_controller_get_linked_user](#linked_users_controller_get_linked_user) |  |


## Organisations

| Method    | Description|
| :-------- | :----------| 
| [organisations_controller_get_oragnisations](#organisations_controller_get_oragnisations) |  |
| [organisations_controller_create_org](#organisations_controller_create_org) |  |


## Projects

| Method    | Description|
| :-------- | :----------| 
| [projects_controller_get_projects](#projects_controller_get_projects) |  |
| [projects_controller_create_project](#projects_controller_create_project) |  |


## CrmContact

| Method    | Description|
| :-------- | :----------| 
| [contact_controller_get_custom_properties](#contact_controller_get_custom_properties) |  |
| [contact_controller_add_contacts](#contact_controller_add_contacts) |  |
| [contact_controller_get_contacts](#contact_controller_get_contacts) |  |
| [contact_controller_update_contact](#contact_controller_update_contact) |  |
| [contact_controller_sync_contacts](#contact_controller_sync_contacts) |  |


## Auth

| Method    | Description|
| :-------- | :----------| 
| [auth_controller_register_user](#auth_controller_register_user) |  |
| [auth_controller_login](#auth_controller_login) |  |
| [auth_controller_users](#auth_controller_users) |  |
| [auth_controller_api_keys](#auth_controller_api_keys) |  |
| [auth_controller_generate_api_key](#auth_controller_generate_api_key) |  |


## Connections

| Method    | Description|
| :-------- | :----------| 
| [connections_controller_handle_callback](#connections_controller_handle_callback) |  |
| [connections_controller_get_connections](#connections_controller_get_connections) |  |




## All Methods


### **app_controller_get_hello**

- HTTP Method: GET
- Endpoint: /

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.main.app_controller_get_hello()

pprint(vars(results))

```


### **passthrough_controller_passthrough_request**

- HTTP Method: POST
- Endpoint: /passthrough

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| integration_id | str | Required |  |
| linked_user_id | str | Required |  |
| request_input | [PassThroughRequestDto](/src/testsdk/models/README.md#passthroughrequestdto) | Required | Request body. |

**Return Type**

[PassThroughResponse](/src/testsdk/models/README.md#passthroughresponse) 

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'data': {},
	'headers_': {},
	'method': 'PUT',
	'path': 'path'
}
results = sdk.passthrough.passthrough_controller_passthrough_request(
	request_input = request_body,
	integration_id = 'integrationId',
	linked_user_id = 'linkedUserId'
)

pprint(vars(results))

```


### **magic_link_controller_create_link**

- HTTP Method: POST
- Endpoint: /magic-link/create

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [CreateMagicLinkDto](/src/testsdk/models/README.md#createmagiclinkdto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'alias': 'alias',
	'email': 'email',
	'id_project': 'id_project',
	'linked_user_origin_id': 'linked_user_origin_id'
}
results = sdk.magic_link.magic_link_controller_create_link(request_input = request_body)

pprint(vars(results))

```

### **magic_link_controller_get_magic_links**

- HTTP Method: GET
- Endpoint: /magic-link

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.magic_link.magic_link_controller_get_magic_links()

pprint(vars(results))

```

### **magic_link_controller_get_magic_link**

- HTTP Method: GET
- Endpoint: /magic-link/single

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| id | str | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.magic_link.magic_link_controller_get_magic_link(id = 'id')

pprint(vars(results))

```


### **events_controller_get_events**

- HTTP Method: GET
- Endpoint: /events

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.events.events_controller_get_events()

pprint(vars(results))

```


### **field_mapping_controller_get_entities**

- HTTP Method: GET
- Endpoint: /field-mapping/entities

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.field_mapping.field_mapping_controller_get_entities()

pprint(vars(results))

```

### **field_mapping_controller_get_attributes**

- HTTP Method: GET
- Endpoint: /field-mapping/attribute

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.field_mapping.field_mapping_controller_get_attributes()

pprint(vars(results))

```

### **field_mapping_controller_get_values**

- HTTP Method: GET
- Endpoint: /field-mapping/value

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.field_mapping.field_mapping_controller_get_values()

pprint(vars(results))

```

### **field_mapping_controller_define_target_field**

- HTTP Method: POST
- Endpoint: /field-mapping/define

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [DefineTargetFieldDto](/src/testsdk/models/README.md#definetargetfielddto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'data_type': 'data_type',
	'description': 'description',
	'name': 'name',
	'object_type_owner': {}
}
results = sdk.field_mapping.field_mapping_controller_define_target_field(request_input = request_body)

pprint(vars(results))

```

### **field_mapping_controller_map_field_to_provider**

- HTTP Method: POST
- Endpoint: /field-mapping/map

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [MapFieldToProviderDto](/src/testsdk/models/README.md#mapfieldtoproviderdto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'attributeId': 'attributeId',
	'linked_user_id': 'linked_user_id',
	'source_custom_field_id': 'source_custom_field_id',
	'source_provider': 'source_provider'
}
results = sdk.field_mapping.field_mapping_controller_map_field_to_provider(request_input = request_body)

pprint(vars(results))

```


### **linked_users_controller_add_linked_user**

- HTTP Method: POST
- Endpoint: /linked-users/create

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [CreateLinkedUserDto](/src/testsdk/models/README.md#createlinkeduserdto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'alias': 'alias',
	'id_project': 'id_project',
	'linked_user_origin_id': 'linked_user_origin_id'
}
results = sdk.linked_users.linked_users_controller_add_linked_user(request_input = request_body)

pprint(vars(results))

```

### **linked_users_controller_get_linked_users**

- HTTP Method: GET
- Endpoint: /linked-users

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.linked_users.linked_users_controller_get_linked_users()

pprint(vars(results))

```

### **linked_users_controller_get_linked_user**

- HTTP Method: GET
- Endpoint: /linked-users/single

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| id | str | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.linked_users.linked_users_controller_get_linked_user(id = 'id')

pprint(vars(results))

```


### **organisations_controller_get_oragnisations**

- HTTP Method: GET
- Endpoint: /organisations

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.organisations.organisations_controller_get_oragnisations()

pprint(vars(results))

```

### **organisations_controller_create_org**

- HTTP Method: POST
- Endpoint: /organisations/create

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [CreateOrganizationDto](/src/testsdk/models/README.md#createorganizationdto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'name': 'name',
	'stripe_customer_id': 'stripe_customer_id'
}
results = sdk.organisations.organisations_controller_create_org(request_input = request_body)

pprint(vars(results))

```


### **projects_controller_get_projects**

- HTTP Method: GET
- Endpoint: /projects

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.projects.projects_controller_get_projects()

pprint(vars(results))

```

### **projects_controller_create_project**

- HTTP Method: POST
- Endpoint: /projects/create

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [CreateProjectDto](/src/testsdk/models/README.md#createprojectdto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'id_organization': 'id_organization',
	'name': 'name'
}
results = sdk.projects.projects_controller_create_project(request_input = request_body)

pprint(vars(results))

```


### **contact_controller_get_custom_properties**

- HTTP Method: GET
- Endpoint: /crm/contact/properties

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| linked_user_id | str | Required |  |
| provider_id | str | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.crm_contact.contact_controller_get_custom_properties(
	linked_user_id = 'linkedUserId',
	provider_id = 'providerId'
)

pprint(vars(results))

```

### **contact_controller_add_contacts**

- HTTP Method: POST
- Endpoint: /crm/contact

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| integration_id | str | Required |  |
| linked_user_id | str | Required |  |
| remote_data | bool | Required |  |
| request_input | object | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {}
results = sdk.crm_contact.contact_controller_add_contacts(
	request_input = request_body,
	integration_id = 'integrationId',
	linked_user_id = 'linkedUserId',
	remote_data = True
)

pprint(vars(results))

```

### **contact_controller_get_contacts**

- HTTP Method: GET
- Endpoint: /crm/contact

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| integration_id | str | Required |  |
| linked_user_id | str | Required |  |
| remote_data | bool | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.crm_contact.contact_controller_get_contacts(
	integration_id = 'integrationId',
	linked_user_id = 'linkedUserId',
	remote_data = True
)

pprint(vars(results))

```

### **contact_controller_update_contact**

- HTTP Method: PATCH
- Endpoint: /crm/contact

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| id | str | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.crm_contact.contact_controller_update_contact(id = 'id')

pprint(vars(results))

```

### **contact_controller_sync_contacts**

- HTTP Method: GET
- Endpoint: /crm/contact/sync

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| integration_id | str | Required |  |
| linked_user_id | str | Required |  |
| remote_data | bool | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.crm_contact.contact_controller_sync_contacts(
	integration_id = 'integrationId',
	linked_user_id = 'linkedUserId',
	remote_data = True
)

pprint(vars(results))

```


### **auth_controller_register_user**

- HTTP Method: POST
- Endpoint: /auth/register

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [CreateUserDto](/src/testsdk/models/README.md#createuserdto) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'email': 'email',
	'first_name': 'first_name',
	'last_name': 'last_name',
	'password_hash': 'password_hash'
}
results = sdk.auth.auth_controller_register_user(request_input = request_body)

pprint(vars(results))

```

### **auth_controller_login**

- HTTP Method: POST
- Endpoint: /auth/login

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [LoginCredentials](/src/testsdk/models/README.md#logincredentials) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {
	'email': 'email',
	'id_user': 48509401.28675595,
	'password_hash': 'password_hash'
}
results = sdk.auth.auth_controller_login(request_input = request_body)

pprint(vars(results))

```

### **auth_controller_users**

- HTTP Method: GET
- Endpoint: /auth/users

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.auth.auth_controller_users()

pprint(vars(results))

```

### **auth_controller_api_keys**

- HTTP Method: GET
- Endpoint: /auth/api-keys

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.auth.auth_controller_api_keys()

pprint(vars(results))

```

### **auth_controller_generate_api_key**

- HTTP Method: POST
- Endpoint: /auth/generate-apikey

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | object | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = {}
results = sdk.auth.auth_controller_generate_api_key(request_input = request_body)

pprint(vars(results))

```


### **connections_controller_handle_callback**

- HTTP Method: GET
- Endpoint: /connections/oauth/callback

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| state | str | Required |  |
| code | str | Required |  |
| location | str | Required |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.connections.connections_controller_handle_callback(
	state = 'state',
	code = 'code',
	location = 'location'
)

pprint(vars(results))

```

### **connections_controller_get_connections**

- HTTP Method: GET
- Endpoint: /connections

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.connections.connections_controller_get_connections()

pprint(vars(results))

```





## License

License: MIT. See license in LICENSE.

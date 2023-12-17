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
| [app_controller_get_hello](#app_controller_get_hello) |  |


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


## Webhook

| Method    | Description|
| :-------- | :----------| 
| [webhook_controller_add_webhook](#webhook_controller_add_webhook) |  |
| [webhook_controller_get_webhooks](#webhook_controller_get_webhooks) |  |
| [webhook_controller_update_webhook_status](#webhook_controller_update_webhook_status) |  |


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


## FieldMapping

| Method    | Description|
| :-------- | :----------| 
| [field_mapping_controller_get_entities](#field_mapping_controller_get_entities) |  |
| [field_mapping_controller_get_attributes](#field_mapping_controller_get_attributes) |  |
| [field_mapping_controller_get_values](#field_mapping_controller_get_values) |  |
| [field_mapping_controller_define_target_field](#field_mapping_controller_define_target_field) |  |
| [field_mapping_controller_map_field_to_provider](#field_mapping_controller_map_field_to_provider) |  |
| [field_mapping_controller_get_custom_properties](#field_mapping_controller_get_custom_properties) |  |


## Events

| Method    | Description|
| :-------- | :----------| 
| [events_controller_get_events](#events_controller_get_events) |  |


## MagicLink

| Method    | Description|
| :-------- | :----------| 
| [magic_link_controller_create_link](#magic_link_controller_create_link) |  |
| [magic_link_controller_get_magic_links](#magic_link_controller_get_magic_links) |  |
| [magic_link_controller_get_magic_link](#magic_link_controller_get_magic_link) |  |


## Passthrough

| Method    | Description|
| :-------- | :----------| 
| [passthrough_controller_passthrough_request](#passthrough_controller_passthrough_request) |  |


## CrmContact

| Method    | Description|
| :-------- | :----------| 
| [contact_controller_add_contacts](#contact_controller_add_contacts) |  |
| [contact_controller_get_contacts](#contact_controller_get_contacts) |  |
| [contact_controller_update_contact](#contact_controller_update_contact) |  |
| [contact_controller_get_contact](#contact_controller_get_contact) |  |




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
	'id_user': 'id_user',
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


### **webhook_controller_add_webhook**

- HTTP Method: POST
- Endpoint: /webhook

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| request_input | [WebhookDto](/src/testsdk/models/README.md#webhookdto) | Required | Request body. |

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
	'description': 'description',
	'id_project': 'id_project',
	'scope': 'scope',
	'url': 'url'
}
results = sdk.webhook.webhook_controller_add_webhook(request_input = request_body)

pprint(vars(results))

```

### **webhook_controller_get_webhooks**

- HTTP Method: GET
- Endpoint: /webhook

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
results = sdk.webhook.webhook_controller_get_webhooks()

pprint(vars(results))

```

### **webhook_controller_update_webhook_status**

- HTTP Method: PUT
- Endpoint: /webhook/{id}

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
results = sdk.webhook.webhook_controller_update_webhook_status(id = 'id')

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

### **field_mapping_controller_get_custom_properties**

- HTTP Method: GET
- Endpoint: /field-mapping/properties

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
results = sdk.field_mapping.field_mapping_controller_get_custom_properties(
	linked_user_id = 'linkedUserId',
	provider_id = 'providerId'
)

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
	'method': 'POST',
	'path': 'path'
}
results = sdk.passthrough.passthrough_controller_passthrough_request(
	request_input = request_body,
	integration_id = 'integrationId',
	linked_user_id = 'linkedUserId'
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
| remote_data | bool | Optional |  |
| request_input | [ContactControllerAddContactsRequest](/src/testsdk/models/README.md#contactcontrolleraddcontactsrequest) | Required | Request body. |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
request_body = [{},{}]
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
| remote_data | bool | Optional |  |

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

### **contact_controller_get_contact**

- HTTP Method: GET
- Endpoint: /crm/contact/{id}

**Parameters**
| Name    | Type| Required | Description |
| :-------- | :----------| :----------| :----------| 
| id | str | Required |  |
| remote_data | bool | Optional |  |

**Return Type**

Returns a dict object.

**Example Usage Code Snippet**
```Python
from os import getenv
from pprint import pprint
from testsdk import Testsdk
sdk = Testsdk()
sdk.set_access_token(getenv("TESTSDK_ACCESS_TOKEN"))
results = sdk.crm_contact.contact_controller_get_contact(
	id = 'id',
	remote_data = True
)

pprint(vars(results))

```





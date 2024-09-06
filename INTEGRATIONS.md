# Adding new Integrations ✨

Make sure you are inside `packages/api/src` where the server lives !

# You want to add a new 3rd Party not yet supported ? 🧑‍🎤

*Ie: Slack, Hubspot, Jira, Shopify ...*

First choose wisely which vertical the 3rd party belongs to among these:

- crm
- ticketing
- accounting
- ats
- file-storage
- hris
- marketing-automation

For the sake of the guide, now on we'll consider adding a 3rd party belonging to the `crm` vertical.

## 1. Add a new connection service for your 3rd Party

Create a new folder with the name of your 3rd party. Let's call it *my3rdParty*.

`cd @core/connections/crm/services/my3rdParty`

Create a new file containing the core logic of your service.

`cd @core/connections/crm/services/my3rdParty/my3rdParty.service.ts`

It must implement the `ICrmConnectionService` interface.

```ts
export interface ICrmConnectionService {
  handleCallback(opts: CallbackParams): Promise<Connection>;
  handleTokenRefresh(opts: RefreshParams): Promise<any>;
}

export type CallbackParams = {
  linkedUserId: string;
  projectId: string;
  code: string;
  location?: string; //for zoho
}

export type RefreshParams = {
  connectionId: string;
  refreshToken: string;
  account_url?: string;
}
```

```ts
import { Injectable } from '@nestjs/common';
import { CallbackParams, ICrmConnectionService, RefreshParams } from '../../types';

@Injectable()
export class My3rdPartyConnectionService implements ICrmConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(My3rdPartyConnectionService.name);
    this.registry.registerService('insert_the_name_of_your_3rd_party', this);
  }

  async handleCallback(
    opts: CallbackParams
  ) {
    return;
  }
  async handleTokenRefresh(opts: RefreshParams) {
    return;
  }
}
```

Now that you have the structure, check other 3rd parties implementations under `/@core/connections/crm/services` to build your functions.

## 2. Enable your connection service to handle oAuth granting access

Add your service to the `CrmConnectionModule` under `@core/connections/crm/crm.connection.module.ts` module !

```ts
@Module({
  imports: [WebhookModule],
  providers: [
    CrmConnectionsService,
    PrismaService,
    ServiceConnectionRegistry,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    FreshsalesConnectionService,
    HubspotConnectionService,
    ZohoConnectionService,
    ZendeskConnectionService,
    PipedriveConnectionService,
    //INSERT YOUR SERVICE HERE
    My3rdPartyConnectionService
  ],
  exports: [CrmConnectionsService],
})
export class CrmConnectionModule {}
```

# You want to map a common object to your new 3rd Party ? 👩‍🎤

*Ie: Contact, Ticket, Deal, Company ...*

For the sake of this guide, let's map the common object `contact` under `crm` vertical to *my3rdParty* just defined just before.

## 1. Add a new service to map your common object to your 3rd party

Create a new service folder with the name of your 3rd party. Let's call it *my3rdParty*.

`cd crm/contact/services/my3rdParty`

You'll now create 3 files.

  `index.ts` *where your service is created and direct interaction with your 3rd party API is handled*

It must implement the `IContactService` interface.

```ts
export interface IContactService {
  addContact(
    contactData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalContactOutput>>;

  syncContacts(
    linkedUserId: string, 
  ): Promise<ApiResponse<OriginalContactOutput[]>>;
}
```

```ts
@Injectable()
export class My3rdPartyService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + My3rdPartyService.name,
    );
    this.registry.registerService('insert_the_name_of_your_3rd_party', this);

  }
  async addContact(
    contactData: 3rdPartyContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<3rdPartyContactOutput>> {}

  async syncContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<3rdPartyContactOutput[]>> {}
}
```

Check other implementations under `/crm/contacts/services` to fill the core functions.

The keen readers may have noticed `3rdPartyContactInput` and `3rdPartyContactOutput`.

This is where `types.ts` comes in:

Go to the 3rd party API and insert the correct types asked by the API.

```ts
export interface 3rdPartyContact {
    //INSERT THE CORRECT TYPE HERE
}
export type 3rdPartyContactInput = Partial<3rdPartyContact>;
export type 3rdPartyContactOutput = 3rdPartyContactInput;
```

Last but not least, inside `mappers.ts` you have to build the mappings between our unified common object `contact` and your third party specific type `3rdPartyContact`.

It must implement `IContactMapper` interface.

```ts
export interface IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalContactOutput | OriginalContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[];
}
```

```ts
export class My3rdPartyMapper implements IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): 3rdPartyContactInput {}

  unify(
    source: 3rdPartyContactOutput | 3rdPartyContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {}
}
```

Check other implementations under `/crm/contacts/services` to fill the core functions.

## 2. Enable your service

`cd crm/contact/types/mappingsTypes.ts`

Add your new 3rd party service to the `contactUnificationMapping` object.

```ts
// ADD YOUR IMPORT HERE
import { My3rdPartyContactMapper } from '@contact/services/my3rdParty/mappers';

const hubspotContactMapper = new HubspotContactMapper();
const zendeskContactMapper = new ZendeskContactMapper();
const zohoContactMapper = new ZohoContactMapper();
const pipedriveContactMapper = new PipedriveContactMapper();
const freshSalesContactMapper = new FreshsalesContactMapper();
// INSERT BELOW YOUR 3rd PARTY HERE
const my3rdPartyContactMapper = new My3rdPartyContactMapper();


export const contactUnificationMapping = {
  hubspot: {
    unify: hubspotContactMapper.unify,
    desunify: hubspotContactMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveContactMapper.unify,
    desunify: pipedriveContactMapper.desunify,
  },
  zoho: {
    unify: zohoContactMapper.unify,
    desunify: zohoContactMapper.desunify,
  },
  ....,
  ....,
  // INSERT BELOW YOUR 3rd PARTY HERE
  my3rdParty: {
    unify: my3rdPartyContactMapper.unify,
    desunify: my3rdPartyContactMapper.desunify,
  },
};
```

Don't forget to add your service you've defined at step 1 inside the module under `/crm/contacts/contact.module.ts`.

```ts
@Module({
  
  controllers: [ContactController],
  providers: [
    ContactService,
    PrismaService,
    LoggerService,
    FieldMappingService,
    SyncService,
    WebhookService,
    EncryptionService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */
    FreshSalesService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    //INSERT YOUR SERVICE HERE
    My3rdPartyService
  ],
  exports: [SyncService],
})
export class ContactModule {}

```

### Congrats Hero ! 🦸‍♀️

### You now have built a new integration with Panora

### NB: The development kit to add integrations out of the blue is coming soon 🎸

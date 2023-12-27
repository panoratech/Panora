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

## 1. Add a new service for your 3rd Party

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

## 2. Add a new connection to handle oAuth granting access

`cd @core/connections/crm/services/crm-connection.service.ts`

Add your new 3rd party service to the `serviceMapping` object.

```ts
private serviceMapping: { [key: string]: ICrmConnectionService } = {
    "hubspot": this.hubspotConnectionService,
    "zoho": this.zohoConnectionService,
    "zendesk": this.zendeskConnectionService,
    "freshsales": this.freshsalesConnectionService,
    "pipedrive": this.pipedriveConnectionService,
    // INSERT BELOW YOUR 3rd PARTY HERE
    "my_3rd_party": this.my3rdPartyConnectionService
};
```

Don't forget to add your service you've defined at step 1 inside the constructor.

```ts
constructor(private my3rdPartyConnectionService: My3rdPartyConnectionService)
```

Finally, don't forget to add your newly created service inside CrmConnectionModule under `/@core/connections/crm/crm-connection.module.ts`

```ts
@Module({
  imports: [WebhookModule],
  providers: [
    CrmConnectionsService,
    PrismaService,
    FreshsalesConnectionService,
    HubspotConnectionService,
    PipedriveConnectionService,
    ZendeskConnectionService,
    ZohoConnectionService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    //INSERT BELOW YOUR SERVICE
    My3rdPartyConnectionService
  ],
  exports: [CrmConnectionsService],
})
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
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + My3rdPartyService.name,
    );
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

Check other implementations under `/crm/contact/services` to fill the core functions.

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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {}
}
```

Check other implementations under `/crm/contact/services` to fill the core functions.

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

Don't forget to add your service you've defined at step 1 inside the Registry under `/crm/contact/services/registry.service.ts`.

```ts
@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IContactService>;

  constructor(
    freshsales: FreshSalesService,
    hubspot: HubspotService,
    zoho: ZohoService,
    zendesk: ZendeskService,
    pipedrive: PipedriveService,
    // ADD YOUR 3RD PARTY HERE
    my3rdParty: My3rdPartyService
  ) {
    this.serviceMap = new Map<string, IContactService>();
    this.serviceMap.set('freshsales', freshsales);
    this.serviceMap.set('hubspot', hubspot);
    this.serviceMap.set('zoho', zoho);
    this.serviceMap.set('zendesk', zendesk);
    this.serviceMap.set('pipedrive', pipedrive);
    // ADD YOUR 3RD PARTY HERE
    this.serviceMap.set('my3rdParty', my3rdParty);
  }
}
```

### Congrats Hero ! 🦸‍♀️

### You now have built a new integration with Panora

### NB: The development kit to add integrations out of the blue is coming soon 🎸

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

```
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

```
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

```
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

```
constructor(private my3rdPartyConnectionService: My3rdPartyConnectionService)
```

# You want to add a new common object not yet supported ? 👩‍🎤

*Ie: Contact, Ticket, Deal, Company ...*

### NB: The development kit to add integrations out of the blue is coming soon 🎸

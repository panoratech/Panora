import {
  convertUnifiedTicketToZendesk,
  convertZendeskTicketToUnified,
} from '@ticketing/ticket/services/zendesk/mappers';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export enum TicketingObject {
  ticket = 'ticket',
}

export type UnifiedTicketing = UnifiedTicketInput | UnifiedTicketOutput;

export const providerUnificationMapping = {
  zendesk: {
    [TicketingObject.ticket]: {
      unify: convertZendeskTicketToUnified,
      desunify: convertUnifiedTicketToZendesk,
    },
    //[CrmObject.deal]: ,
    //[CrmObject.company]:,
  },
};

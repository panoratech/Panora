export type NonTicketPayload = {
  type: string;
  account_id: number;
  id: string;
  time: string;
  zendesk_event_version: string;
  subject: string;
  detail: {
    [key: string]: any;
    id: string;
  };
  event: {
    [key: string]: any;
  };
};

export type TicketPayload = {
  ticket_id: string;
};

export type Payload = NonTicketPayload | TicketPayload;

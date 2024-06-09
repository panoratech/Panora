export class Payload {
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
}

// events supported by Zendesk (unified Panora form)
export const webhookEvents = [
  'ticketing.tickets.events',
  'ticketing.comments.events',
  'ticketing.tags.events',
  'ticketing.attachments.events',
  'ticketing.accounts.events',
  'ticketing.users.events',
  'ticketing.contacts.events',
];

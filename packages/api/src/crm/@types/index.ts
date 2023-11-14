export enum CrmObject {
  company = 'company',
  contact = 'contact',
  deal = 'deal',
  event = 'event',
  lead = 'lead',
  note = 'note',
  task = 'task',
  user = 'user',
}

export * from './../contact/services/freshsales/types';
export * from './../contact/services/zendesk/types';
export * from './../contact/services/hubspot/types';
export * from './../contact/services/zoho/types';
export * from './../contact/services/pipedrive/types';

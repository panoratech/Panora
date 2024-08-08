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

export enum HrisObject {}

export enum AtsObject {
  activity = 'activity',
  application = 'application',
  attachment = 'attachment',
  candidate = 'candidate',
  department = 'department',
  eeocs = 'eeocs',
  interview = 'interview',
  job = 'job',
  jobinterviewstage = 'jobinterviewstage',
  offer = 'offer',
  office = 'office',
  rejectreason = 'rejectreason',
  scorecard = 'scorecard',
  tag = 'tag',
  user = 'user'
}

export enum AccountingObject {}

export enum EcommerceObject {
 order = 'order',
 fulfillment = 'fulfillment',
 product = 'product',
 customer = 'customer',
 fulfillmentorders = 'fulfillmentorders'
}

export enum FileStorageObject {
    drive = 'drive',
    file = 'file',
    folder = 'folder',
    group = 'group',
    user = 'user'
}

export enum MarketingAutomationObject {}

export enum TicketingObject {
    ticket = 'ticket',
    comment = 'comment',
    user = 'user',
    attachment = 'attachment',
    contact = 'contact',
    account = 'account',
    tag = 'tag',
    team = 'team',
    collection = 'collection'
}
// Utility function to prepend prefix to enum values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prependPrefixToEnumValues = (prefix: string, enumObj: any) => {
    return Object.values(enumObj).map(value => `${prefix}.${value}`);
}

export const standardObjects = [
    ...prependPrefixToEnumValues('crm', CrmObject),
    ...prependPrefixToEnumValues('ticketing', TicketingObject),
    ...prependPrefixToEnumValues('filestorage', FileStorageObject),
    ...prependPrefixToEnumValues('ats', AtsObject),
    ...prependPrefixToEnumValues('ecommerce', EcommerceObject),
];

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

export enum AtsObject {}

export enum AccountingObject {}

export enum FileStorageObject {}

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
}
// Utility function to prepend prefix to enum values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prependPrefixToEnumValues = (prefix: string, enumObj: any) => {
    return Object.values(enumObj).map(value => `${prefix}.${value}`);
}

export const standardObjects = [
    ...prependPrefixToEnumValues('crm', CrmObject),
    ...prependPrefixToEnumValues('ticketing', TicketingObject),
];
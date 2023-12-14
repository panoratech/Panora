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

export enum TicketingObject {}

export const standardOjects = [
    ...Object.values(CrmObject),
    /*...Object.values(HrisObject),
    ...Object.values(AtsObject),
    ...Object.values(AccountingObject),
    ...Object.values(FileStorageObject),
    ...Object.values(MarketingAutomationObject),
    ...Object.values(TicketingObject),*/
];
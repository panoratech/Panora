export enum ConnectorCategory {
    Crm = 'crm',
    Hris = 'hris',
    Ats = 'ats',
    Accounting = 'accounting',
    Ticketing = 'ticketing',
    MarketingAutomation = 'marketingautomation',
    FileStorage = 'filestorage',
    Management = 'management'
}

export const categoriesVerticals: ConnectorCategory[] = Object.values(ConnectorCategory);

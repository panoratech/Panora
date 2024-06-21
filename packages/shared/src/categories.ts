export enum ConnectorCategory {
    Crm = 'crm',
    Hris = 'hris',
    Ats = 'ats',
    Accounting = 'accounting',
    Ticketing = 'ticketing',
    MarketingAutomation = 'marketingautomation',
    FileStorage = 'filestorage',
}

export const categoriesVerticals: ConnectorCategory[] = Object.values(ConnectorCategory);

export enum ConnectorCategory {
    Crm = 'crm',
    Accounting = 'accounting',
    Ticketing = 'ticketing',
    MarketingAutomation = 'marketingautomation',
    FileStorage = 'filestorage',
    Productivity = 'productivity',
    Ecommerce = 'ecommerce',
    Cybersecurity = 'cybersecurity'
}

export const categoriesVerticals: ConnectorCategory[] = Object.values(ConnectorCategory);

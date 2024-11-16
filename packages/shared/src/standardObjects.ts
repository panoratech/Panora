export enum CrmObject {
    company = 'company',
    contact = 'contact',
    deal = 'deal',
    note = 'note',
    task = 'task',
    engagement = 'engagement',
    stage = 'stage',
    user = 'user',
}

export enum AccountingObject {
    balancesheet = 'balancesheet',
    cashflowstatement = 'cashflowstatement',
    companyinfo = 'companyinfo',
    contact = 'contact',
    creditnote = 'creditnote',
    expense = 'expense',
    incomestatement = 'incomestatement',
    invoice = 'invoice',
    item = 'item',
    journalentry = 'journalentry',
    payment = 'payment',
    phonenumber = 'phonenumber',
    purchaseorder = 'purchaseorder',
    taxrate = 'taxrate',
    trackingcategory = 'trackingcategory',
    transaction = 'transaction',
    vendorcredit = 'vendorcredit',
    account = 'account',
    address = 'address',
    attachment = 'attachment',
}

export enum EcommerceObject {
    order = 'order',
    fulfillment = 'fulfillment',
    product = 'product',
    customer = 'customer',
    fulfillmentorders = 'fulfillmentorders'
}

export enum FileStorageObject {
    file = 'file',
    folder = 'folder',
    permission = 'permission',
    drive = 'drive',
    sharedlink = 'sharedlink',
    group = 'group',
    user = 'user',
}

export enum MarketingAutomationObject {
    action = 'action',
    automation = 'automation',
    campaign = 'campaign',
    contact = 'contact',
    email = 'email',
    event = 'event',
    list = 'list',
    message = 'message',
    template = 'template',
    user = 'user',
}

export enum TicketingObject {
    ticket = 'ticket',
    comment = 'comment',
    user = 'user',
    // attachment = 'attachment',
    contact = 'contact',
    account = 'account',
    tag = 'tag',
    team = 'team',
    collection = 'collection',
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
    ...prependPrefixToEnumValues('ecommerce', EcommerceObject),
];

export function getCrmCommonObjects(): string[] {
    return Object.values(CrmObject);
  }

export function getAccountingCommonObjects(): string[] {
  return Object.values(AccountingObject);
}

export function getEcommerceCommonObjects(): string[] {
  return Object.values(EcommerceObject);
}

export function getFileStorageCommonObjects(): string[] {
  return Object.values(FileStorageObject);
}

export function getMarketingAutomationCommonObjects(): string[] {
  return Object.values(MarketingAutomationObject);
}

export function getTicketingCommonObjects(): string[] {
  return Object.values(TicketingObject);
}

// A utility function to get common objects for any vertical
export function getCommonObjectsForVertical(vertical: string): string[] {
  switch (vertical.toLowerCase()) {
    case 'crm':
      return getCrmCommonObjects();
    case 'accounting':
      return getAccountingCommonObjects();
    case 'ecommerce':
      return getEcommerceCommonObjects();
    case 'filestorage':
      return getFileStorageCommonObjects();
    case 'marketingautomation':
      return getMarketingAutomationCommonObjects();
    case 'ticketing':
      return getTicketingCommonObjects();
    default:
      throw new Error(`Unknown vertical: ${vertical}`);
  }
}

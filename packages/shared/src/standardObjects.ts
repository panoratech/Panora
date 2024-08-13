export enum CrmObject {
    company = 'company',
    contact = 'contact',
    deal = 'deal',
    lead = 'lead',
    note = 'note',
    task = 'task',
    engagement = 'engagement',
    stage = 'stage',
    user = 'user',
}

export enum HrisObject {
    bankinfo = 'bankinfo',
    benefit = 'benefit',
    company = 'company',
    dependent = 'dependent',
    employee = 'employee',
    employeepayrollrun = 'employeepayrollrun',
    employerbenefit = 'employerbenefit',
    employment = 'employment',
    group = 'group',
    location = 'location',
    paygroup = 'paygroup',
    payrollrun = 'payrollrun',
    timeoff = 'timeoff',
    timeoffbalance = 'timeoffbalance',
    timesheetentry = 'timesheetentry',
}

export enum AtsObject {
    activity = 'activity',
    application = 'application',
    attachment = 'attachment',
    candidate = 'candidate',
    department = 'department',
    interview = 'interview',
    jobinterviewstage = 'jobinterviewstage',
    job = 'job',
    offer = 'offer',
    office = 'office',
    rejectreason = 'rejectreason',
    scorecard = 'scorecard',
    tag = 'tag',
    user = 'user',
    eeocs = 'eeocs',
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
    attachment = 'attachment',
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
    ...prependPrefixToEnumValues('ats', AtsObject),
    ...prependPrefixToEnumValues('ecommerce', EcommerceObject),
];

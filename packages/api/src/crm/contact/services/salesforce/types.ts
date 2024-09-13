export interface SalesforceContactInput {
  FirstName?: string;
  LastName: string; // Required in Salesforce
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Title?: string;
  Department?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingCountry?: string;
  MailingPostalCode?: string;
  AccountId?: string; // Reference to the Account (Company) the contact is associated with
  [key: string]: any;
}

export interface SalesforceContactOutput extends SalesforceContactInput {
  Id: string;
  CreatedDate: string;
  LastModifiedDate: string;
  IsDeleted: boolean;
}

export const commonSalesforceContactProperties = {
  Id: '',
  FirstName: '',
  LastName: '',
  Email: '',
  Phone: '',
  MobilePhone: '',
  Title: '',
  Department: '',
  MailingStreet: '',
  MailingCity: '',
  MailingState: '',
  MailingCountry: '',
  MailingPostalCode: '',
  AccountId: '',
  CreatedDate: '',
  LastModifiedDate: '',
  IsDeleted: false,
};
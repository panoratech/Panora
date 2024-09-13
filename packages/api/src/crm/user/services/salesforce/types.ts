export interface SalesforceUserInput {
  // Salesforce doesn't typically allow creating users via API,
  // so this interface might be empty or have limited fields
  [key: string]: any;
}

export interface SalesforceUserOutput {
  Id: string;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  IsActive: boolean;
  UserRoleId?: string;
  ProfileId: string;
  Alias: string;
  TimeZoneSidKey: string;
  LocaleSidKey: string;
  EmailEncodingKey: string;
  LanguageLocaleKey: string;
  [key: string]: any;
}

export const commonUserSalesforceProperties = {
  Id: '',
  Username: '',
  Email: '',
  FirstName: '',
  LastName: '',
  IsActive: false,
  UserRoleId: '',
  ProfileId: '',
  Alias: '',
  TimeZoneSidKey: '',
  LocaleSidKey: '',
  EmailEncodingKey: '',
  LanguageLocaleKey: '',
};
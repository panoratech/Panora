export interface SalesforceNoteInput {
  Title: string; // Required in Salesforce
  Content: string; // Required in Salesforce
  [key: string]: any;
}

export interface SalesforceNoteOutput extends SalesforceNoteInput {
  Id: string;
  OwnerId: string;
  CreatedDate: string;
  LastModifiedDate: string;
  IsDeleted: boolean;
  FileExtension: string;
  ContentSize: number;
}

export const commonNoteSalesforceProperties = {
  Id: '',
  Title: '',
  Content: '',
  OwnerId: '',
  CreatedDate: '',
  LastModifiedDate: '',
  IsDeleted: false,
  FileExtension: '',
  ContentSize: 0,
};
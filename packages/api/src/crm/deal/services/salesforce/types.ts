export interface SalesforceDealInput {
  Name: string;
  Amount?: number;
  StageName: string; // Required in Salesforce
  CloseDate: string; // Required in Salesforce
  AccountId?: string;
  OwnerId?: string;
  Type?: string;
  Probability?: number;
  [key: string]: any;
}

export interface SalesforceDealOutput extends SalesforceDealInput {
  Id: string;
  CreatedDate: string;
  LastModifiedDate: string;
  IsDeleted: boolean;
  IsClosed: boolean;
  IsWon: boolean;
}

export const commonDealSalesforceProperties = {
  Id: '',
  Name: '',
  Amount: 0,
  StageName: '',
  CloseDate: '',
  AccountId: '',
  OwnerId: '',
  Type: '',
  Probability: 0,
  Description: '',
  CreatedDate: '',
  LastModifiedDate: '',
  IsDeleted: false,
  IsClosed: false,
  IsWon: false,
};
export interface SalesforceTaskInput {
  Subject: string;
  Description?: string;
  Status: string;
  Priority?: string;
  ActivityDate?: string;
  OwnerId?: string;
  WhatId?: string; // Related To ID (can be Account, Opportunity, etc.)
  WhoId?: string; // Related Contact or Lead ID
  [key: string]: any;
}

export interface SalesforceTaskOutput extends SalesforceTaskInput {
  Id: string;
  CreatedDate: string;
  LastModifiedDate: string;
  IsDeleted: boolean;
  IsClosed: boolean;
}

export const commonTaskSalesforceProperties = {
  Id: '',
  Subject: '',
  Description: '',
  Status: '',
  Priority: '',
  ActivityDate: '',
  OwnerId: '',
  WhatId: '',
  WhoId: '',
  CreatedDate: '',
  LastModifiedDate: '',
  IsDeleted: false,
  IsClosed: false,
};
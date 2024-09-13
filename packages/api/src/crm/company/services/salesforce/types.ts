export interface SalesforceCompanyInput {
  Name: string;
  AccountNumber?: string;
  AccountSource?: string;
  AnnualRevenue?: number;
  BillingAddress?: {
    city?: string;
    country?: string;
    postalCode?: string;
    state?: string;
    street?: string;
  };
  Description?: string;
  Fax?: string;
  Industry?: string;
  NumberOfEmployees?: number;
  OwnerId?: string;
  ParentId?: string;
  Phone?: string;
  Rating?: string;
  ShippingAddress?: {
    city?: string;
    country?: string;
    postalCode?: string;
    state?: string;
    street?: string;
  };
  Sic?: string;
  SicDesc?: string;
  Site?: string;
  TickerSymbol?: string;
  Type?: string;
  Website?: string;
  [key: string]: any;
}

export interface SalesforceCompanyOutput extends SalesforceCompanyInput {
  Id: string;
  CreatedDate: string;
  LastModifiedDate: string;
  IsDeleted: boolean;
}

export const commonSalesforceCompanyProperties = {
  Id: '',
  Name: '',
  AccountNumber: '',
  AccountSource: '',
  AnnualRevenue: 0,
  BillingAddress: {
    city: '',
    country: '',
    postalCode: '',
    state: '',
    street: '',
  },
  Description: '',
  Fax: '',
  Industry: '',
  NumberOfEmployees: 0,
  OwnerId: '',
  ParentId: '',
  Phone: '',
  Rating: '',
  ShippingAddress: {
    city: '',
    country: '',
    postalCode: '',
    state: '',
    street: '',
  },
  Sic: '',
  SicDesc: '',
  Site: '',
  TickerSymbol: '',
  Type: '',
  Website: '',
  CreatedDate: '',
  LastModifiedDate: '',
  IsDeleted: false,
};
export interface ZendeskCompany {
  id: number; // Unique identifier of the account
  name?: string; // Full name of the account
  currency?: string; // Currency of the account as the 3-character currency code in ISO4217 format
  time_format?: '12H' | '24H'; // Time format used for the account. Either 12-hour clock '12H' or 24-hour clock '24H'
  timezone?: string; // Timezone of the account as the offset from Coordinated Universal Time (UTC) in the format UTC(+/-)[hh]:[mm]
  phone?: string; // Contact phone number of the account
  subdomain?: string; // Subdomain of the account, null for legacy accounts
  created_at: string; // Date and time of the account's creation in UTC (ISO8601 format)
  updated_at: string; // Date
}

export type ZendeskCompanyInput = Partial<ZendeskCompany>;
export type ZendeskCompanyOutput = ZendeskCompanyInput;

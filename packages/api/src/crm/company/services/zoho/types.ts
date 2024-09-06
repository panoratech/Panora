interface ZohoCompany {
  Owner: Partial<PersonDetail>;
  $currency_symbol: string;
  Account_Type: string;
  SIC_Code: string | null;
  Last_Activity_Time: string;
  Industry: string;
  Account_Site: string;
  $process_flow: boolean;
  Exchange_Rate: number;
  Currency: string;
  Billing_Country: string;
  id: string;
  $approved: boolean;
  $approval: ApprovalProcess;
  Billing_Street: string;
  Created_Time: string;
  $editable: boolean;
  Billing_Code: string;
  Shipping_City: string;
  Shipping_Country: string;
  Shipping_Code: string;
  Billing_City: string;
  Created_By: PersonDetail;
  Annual_Revenue: number;
  Shipping_Street: string;
  Ownership: string;
  Description: string;
  Rating: string;
  Shipping_State: string;
  $review_process: ReviewProcess;
  Website: string;
  Employees: number;
  Record_Image: string | null;
  Modified_By: PersonDetail;
  $review: any | null;
  Phone: string;
  Account_Name: string;
  Account_Number: string;
  Ticker_Symbol: string;
  Modified_Time: string;
  Territories: string[];
  $orchestration: boolean;
  Parent_Account: ParentAccountDetail;
  $in_merge: boolean;
  Billing_State: string;
  Tag: string[];
  Fax: string;
  $approval_state: string;
}

interface PersonDetail {
  name: string;
  id: string;
  email: string;
}

interface ApprovalProcess {
  delegate: boolean;
  approve: boolean;
  reject: boolean;
  resubmit: boolean;
}

interface ReviewProcess {
  approve: boolean;
  reject: boolean;
  resubmit: boolean;
}

interface ParentAccountDetail {
  name: string;
  id: string;
}

export type ZohoCompanyInput = Partial<ZohoCompany>;
export type ZohoCompanyOutput = ZohoCompanyInput;

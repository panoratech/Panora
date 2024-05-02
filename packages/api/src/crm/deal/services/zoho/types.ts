interface ZohoDeal {
  Owner: Owner;
  Description: string;
  $currency_symbol: string;
  Campaign_Source: CampaignSource;
  $review_process: ReviewProcess;
  $followers: null; // Assuming no further details are provided for the type of followers
  Closing_Date: string;
  Last_Activity_Time: string;
  $review: null; // Assuming no further details are provided for the review type
  Lead_Conversion_Time: number;
  $process_flow: boolean;
  Deal_Name: string;
  Exchange_Rate: number;
  Expected_Revenue: number;
  Currency: string;
  Overall_Sales_Duration: number;
  Stage: string;
  Account_Name: AccountName;
  id: string;
  $approved: boolean;
  $approval: Approval;
  Territory: string[];
  Amount: number;
  $followed: boolean;
  Probability: number;
  Next_Step: string;
  $editable: boolean;
  $orchestration: boolean;
  Contact_Name: ContactName;
  Sales_Cycle_Duration: number;
  Type: string;
  Layout: Layout;
  $in_merge: boolean;
  Lead_Source: string;
  Tag: string[];
  $approval_state: string;
}

interface Owner {
  name: string;
  id: string;
  email: string;
}

interface CampaignSource {
  name: string;
  id: string;
}

interface ReviewProcess {
  approve: boolean;
  reject: boolean;
  resubmit: boolean;
}

interface AccountName {
  name: string;
  id: string;
}

interface Approval {
  delegate: boolean;
  approve: boolean;
  reject: boolean;
  resubmit: boolean;
}

interface ContactName {
  name: string;
  id: string;
}

interface Layout {
  name: string;
  id: string;
}

export type ZohoDealInput = Partial<ZohoDeal>;
export type ZohoDealOutput = ZohoDealInput;

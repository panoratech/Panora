interface ZohoEngagement {
  facebookadvertmanager__facebook_Account: FacebookAccount | null;
  Owner: PersonDetail;
  Description: string;
  $currency_symbol: string;
  Campaign_Name: string;
  $review_process: any | null;
  facebookadvertmanager__Lead_Source: string;
  End_Date: string;
  facebookadvertmanager__Buying_Type: any | null;
  facebookadvertmanager__Updated_Time: string;
  Modified_By: PersonDetail;
  $review: any | null;
  Num_sent: string;
  $process_flow: boolean;
  Exchange_Rate: number;
  Expected_Revenue: number;
  Currency: string;
  Actual_Cost: number;
  id: string;
  Expected_Response: any | null;
  Start_Date: string;
  $approved: boolean;
  facebookadvertmanager__Stop_Time: string;
  Status: string;
  facebookadvertmanager__Account_Id: string | null;
  $approval: ApprovalProcess;
  Modified_Time: string;
  facebookadvertmanager__Objective: string;
  facebookadvertmanager__Budget_Rebalance_Flag: string;
  Created_Time: string;
  facebookadvertmanager__Effective_Status: string;
  $editable: boolean;
  facebookadvertmanager__Start_Time: string;
  $orchestration: boolean;
  Type: string;
  $in_merge: boolean;
  facebookadvertmanager__Use_Spend_Cap: any | null;
  Created_By: PersonDetail;
  Parent_Campaign: ParentCampaign | null;
  Tag: string[];
  $approval_state: string;
  Budgeted_Cost: number;
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

interface FacebookAccount {
  name: string;
  id: string;
}

interface ParentCampaign {
  name?: string;
  id?: string;
  email?: string;
}

export type ZohoEngagementInput = Partial<ZohoEngagement>;
export type ZohoEngagementOutput = ZohoEngagementInput;

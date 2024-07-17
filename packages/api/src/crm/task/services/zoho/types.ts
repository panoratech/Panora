interface ZohoTask {
  Owner: Partial<PersonDetail>;
  Description: string;
  $currency_symbol: string;
  Closed_Time: string | null;
  $review_process: any | null;
  Expected_Revenue: number;
  Send_Notification_Email: boolean;
  Modified_By: PersonDetail;
  $review: any | null;
  $process_flow: boolean;
  Exchange_Rate: number;
  Currency: string;
  id: string;
  $approved: boolean;
  Remind_At: Reminder | null;
  Who_Id: RelatedPerson;
  Status: string;
  $approval: ApprovalProcess;
  Modified_Time: string;
  Due_Date: string;
  Priority: 'High' | 'Highest' | 'Low' | 'Lowest' | 'Normal';
  Created_Time: string;
  $editable: boolean;
  Subject: string;
  $orchestration: boolean;
  $se_module: string;
  Recurring_Activity: RecurrenceRule | null;
  What_Id: RelatedAccount;
  $in_merge: boolean;
  Tag: string[];
  Created_By: PersonDetail;
  $approval_state: 'approved' | 'not_approved'; // Assuming 'not_approved' is a valid state
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

interface RelatedPerson {
  name: string;
  id: string;
}

interface RelatedAccount {
  name: string;
  id: string;
}

interface Reminder {
  type: 'email' | 'pop up'; // Assuming these are the only two types
  date: string;
  frequency: number; // Frequency could be defined more specifically based on the application's needs
}

interface RecurrenceRule {
  RRULE: string; // This could be further detailed based on the actual recurrence pattern format
}

export type ZohoTaskInput = Partial<ZohoTask>;
export type ZohoTaskOutput = ZohoTaskInput;

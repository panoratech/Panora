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

interface ApprovalProcess {
  delegate: boolean;
  approve: boolean;
  reject: boolean;
  resubmit: boolean;
}

interface CallDetails {
  Call_Duration: string;
  Owner: PersonDetail;
  Description: string;
  $currency_symbol: string;
  Caller_ID: string | null;
  $calendar_booking_call: boolean;
  $review_process: any | null;
  Call_Agenda: string;
  Modified_By: PersonDetail;
  $review: any | null;
  $process_flow: boolean;
  Call_Purpose: string;
  id: string;
  Call_Status: string;
  $approved: boolean;
  Who_Id: PersonDetail;
  $approval: ApprovalProcess;
  Modified_Time: string;
  Reminder: string | null;
  Created_Time: string;
  Call_Start_Time: string;
  $editable: boolean;
  Subject: string;
  $orchestration: boolean;
  $se_module: string;
  Call_Type: string;
  Call_Result: string;
  What_Id: PersonDetail;
  $in_merge: boolean;
  Call_Duration_in_seconds: string;
  Created_By: PersonDetail;
  Tag: string[];
  Dialled_Number: string | null;
  $approval_state: string;
}

export type ZohoEngagementCallInput = Partial<CallDetails>;
export type ZohoEngagementCallOutput = ZohoEngagementCallInput;

interface Participant {
  Email: string;
  name: string;
  invited: boolean;
  id: string;
  type: string;
  participant: string;
  status: string;
}

interface ApprovalProcess {
  delegate: boolean;
  approve: boolean;
  reject: boolean;
  resubmit: boolean;
}

interface RecurringActivity {
  RRULE: string;
}

interface EventDetails {
  All_day: boolean;
  Owner: PersonDetail;
  Check_In_State: any | null;
  $currency_symbol: string;
  Latitude: any | null;
  Participants: Participant[];
  $process_flow: boolean;
  Exchange_Rate: number;
  Currency: string;
  Check_In_City: any | null;
  id: string;
  Check_In_Comment: any | null;
  $approved: boolean;
  Remind_At: string;
  Who_Id: PersonDetail;
  Check_In_Status: string;
  $approval: ApprovalProcess;
  Venue: string;
  ZIP_Code: any | null;
  Created_Time: string;
  $editable: boolean;
  Longitude: any | null;
  Check_In_Time: any | null;
  Recurring_Activity: RecurringActivity;
  What_Id: PersonDetail;
  Created_By: PersonDetail;
  Check_In_Address: any | null;
  Description: any | null;
  Start_DateTime: string;
  $review_process: any | null;
  Event_Title: string;
  $calendar_booking_event: boolean;
  End_DateTime: string;
  Check_In_By: any | null;
  Modified_By: PersonDetail;
  $review: any | null;
  Check_In_Country: any | null;
  Modified_Time: string;
  $recurrence_id: any | null;
  $orchestration: boolean;
  $se_module: string;
  Check_In_Sub_Locality: any | null;
  $in_merge: boolean;
  $meeting_details: any | null;
  $u_id: string;
  Tag: string[];
  $send_notification: boolean;
  $approval_state: string;
}

export type ZohoEngagementMeetingInput = Partial<EventDetails>;
export type ZohoEngagementMeetingOutput = EventDetails;

export type ZohoEngagementInput =
  | ZohoEngagementMeetingInput
  | ZohoEngagementCallInput;

export type ZohoEngagementOutput =
  | ZohoEngagementMeetingOutput
  | ZohoEngagementCallOutput;

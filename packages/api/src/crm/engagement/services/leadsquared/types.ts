interface KeyValuePair {
  [key: string]: unknown;
}

export type LeadSquaredEngagementCall = {
  SourceNumber: string; //'+91-8611795988';
  CallerSource: string; //'Example Source';
  DestinationNumber: string; //'+91-9611795983';
  DisplayNumber: string; //'+91-8611795989';
  StartTime: string; //'2017-07-07 18:26:38';
  EndTime: string; //'2017-07-07 18:26:38';
  CallDuration: number; // in seconds
  Status:
    | 'Answered'
    | 'Missed'
    | 'Declined'
    | 'Busy'
    | 'Cancelled'
    | 'No Answer';
  ResourceURL: string;
  Direction: 'Inbound' | 'Outbound';
  CallSessionId: string;
  LeadId: string;
  Tag: string;
  UserId: string;
};

type SenderType =
  | 'UserId' // Sender is a user ID
  | 'UserEmailAddress' // Sender is a user email address
  | 'APICaller' // Sender = ""
  | 'LeadOwner'; // Sender = ""

type RecipientType =
  | 'LeadEmailAddress' // Recipient is a email address
  | 'Lead Number' // Recipient is lead number
  | 'LeadId'; // Recipient is lead id

type LeadSquaredEngagementEmail = {
  SenderType: SenderType;
  Sender: string;
  CCEmailAddress: string;
  RecipientType: RecipientType;
  RecipientEmailFields?: '';
  Recipient: string;
  EmailType: 'Html' | 'Template';
  EmailLibraryName: ''; // if EmailType = 'Template';
  ContentHTML: string;
  ContentText: string;
  Subject: string;
  IncludeEmailFooter: boolean;
  Schedule: string; //'2017-10-13 10:00:00';
  EmailCategory?: string;
  EmailId: string;
  RelatedProspectId: string;
  FromEmail: string;
  RecipientEmailIds: string;
  Content_Html: string;
  Content_Text: string;
  SentOn: string; //'2017
};

export type LeadSquaredEngagementEmailInput =
  Partial<LeadSquaredEngagementEmail>;
export type LeadSquaredEngagementEmailOutput = LeadSquaredEngagementEmailInput;

interface LeadSquaredEngagementMeeting {
  UserTaskId: string;
  Name: string;
  Category: number;
  Description: string;
  // "0" if you're not passing any value
  // "1" if you're passing the LeadId
  // "5" if you're passing the OpportunityId
  RelatedEntity: '0' | '1' | '5';
  RelatedEntityId: string;
  DueDate: string; //"2022-02-23 13:10:00.000"
  Reminder: number;
  ReminderBeforeDays: number;
  NotifyBy: '1100' | '1000'; // "1100" if you want the task owner to notify by email
  // "1000" Do'nt want any notification
  StatusCode: '0' | '1'; // 0 = incomplete, 1 = completed
  OwnerId: string;
  OwnerName: string;
  CreatedBy: string;
  CreatedByName: string;
  CreatedOn: string; //"2021-11-24 09:43:28.000",
  ModifiedBy: string;
  ModifiedByName: string;
  ModifiedOn: string; //"2022-02-23 07:00:41.000",
  RelatedEntityIdName: string;
  CompletedOn: string; //"0001-01-01 00:00:00.000",
  TaskType: KeyValuePair;
  OwnerEmailAddress: string;
  EndDate: string; //"2022-02-23 13:15:00",
  PercentCompleted: number;
  EffortEstimateUnit: string;
  Priority: string;
  Location: string;
  CustomFields: KeyValuePair;
}
export type LeadSquaredEngagementCallInput = Partial<LeadSquaredEngagementCall>;

export type LeadSquaredEngagementMeetingInput =
  Partial<LeadSquaredEngagementMeeting>;

export type LeadSquaredEngagementMeetingOutput =
  LeadSquaredEngagementMeetingInput;

export type LeadSquaredEngagementOutput =
  | LeadSquaredEngagementEmailOutput
  | LeadSquaredEngagementMeetingOutput;
export type LeadSquaredEngagementInput =
  | LeadSquaredEngagementEmailInput
  | LeadSquaredEngagementMeetingInput
  | LeadSquaredEngagementCallInput;

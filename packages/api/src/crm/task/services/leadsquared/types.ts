type KeyValuePair = Record<string, unknown>;

interface LeadSquaredTask {
  UserTaskId: string;
  Name: string;
  Category: number;
  Description: string;
  // "1" if you're passing the LeadId
  // "5" if you're passing the OpportunityId
  // "0" if you're not passing any value
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
  Priority: string;
  Location: string;
  CustomFields: KeyValuePair;
}

export type LeadSquaredTaskInput = Partial<LeadSquaredTask>;
export type LeadSquaredTaskOutput = LeadSquaredTaskInput;

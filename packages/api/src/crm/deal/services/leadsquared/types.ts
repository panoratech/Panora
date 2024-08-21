type LeadDetail = {
  Attribute: string;
  Value: string;
};

type Field = {
  SchemaName: string;
  Value: string;
};

type Opportunity = {
  Fields?: Field[];
  OpportunityEventCode: number;
  OpportunityNote?: string;
  OpportunityDateTime?: string; //date and time is in the yyyy-mm-dd hh:mm:ss format.
  OverwriteFields?: boolean;
  UpdateEmptyFields?: boolean;
  DoNotPostDuplicateActivity?: boolean;
  DoNotChangeOwner?: boolean;
};

export type LeadSquaredDealInput = {
  LeadDetails: LeadDetail[]; // atleast 1 unique field is required. Attribute 'SearchBy' is required
  Opportunity: Opportunity;
};

export type LeadSquaredDealOutput = {
  ProspectId: string;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  Phone: string;
  DoNotCall: '0' | '1';
  DoNotEmail: '0' | '1';
  LeadName: string;
  LeadOwner: string;
  OpportunityEventType: string;
  OpportunityEvent: string;
  OpportunityNote: string;
  Score: string;
  PACreatedOn: string; //'2020-09-16 05:43:00';
  PAModifiedOn: string; //'2020-09-16 07:26:09';
  IP_Latitude: string | null;
  IP_Longitude: string | null;
  PACreatedByName: string;
  Status: string;
  Owner: string;
  OwnerName: string;
  OpportunityId: string;
  Total: string;
  [key: string]: string | number | null;
};

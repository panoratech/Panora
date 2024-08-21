type LeadSquaredContact = {
  /*
   * user_id
   * first_name
   * last_name
   * email
   * phone
   * address
   */
  ProspectID: string;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  Company: string;
  OwnerId: string;
  Origin: string;
  Phone: string | null;
  Mobile: string | null;
  Website: string | null;
  TimeZone: string | null;
  Source: string;
  SourceMedium: string | null;
  Notes: string | null;
  SourceCampaign: string | null;
  SourceContent: string | null;
  DoNotEmail: '0' | '1';
  DoNotCall: '0' | '1';
  ProspectStage: string;
  Score: string;
  Revenue: string;
  EngagementScore: string;
  TotalVisits: string | null;
  PageViewsPerVisit: string | null;
  AvgTimePerVisit: string | null;
  RelatedProspectId: string | null;
  ProspectActivityId_Min: string;
  ProspectActivityDate_Min: string;
  Web_Referrer: string | null;
  Web_RefKeyword: string | null;
  ProspectActivityId_Max: string;
  ProspectActivityName_Max: string;
  ProspectActivityDate_Max: string;
  RelatedLandingPageId: string | null;
  FirstLandingPageSubmissionId: string | null;
  FirstLandingPageSubmissionDate: string | null;
  CreatedBy: string;
  CreatedOn: string;
  ModifiedBy: string;
  ModifiedOn: string;
  LeadConversionDate: string | null;
  StatusCode: '0';
  StatusReason: '0';
  IsLead: '1';
  NotableEvent: 'Modified';
  NotableEventdate: string;
  SourceReferrer: string | null;
  LastVisitDate: string;
  CompanyType: string | null;
  RelatedCompanyId: string | null;
  IsPrimaryContact: string;
  MailingPreferences: string | null;
  LastOptInEmailSentDate: null;
  DoNotTrack: null;
  RelatedCompanyIdName: null;
  RelatedCompanyOwnerId: null;
  CompanyTypeName: null;
  CompanyTypePluralName: null;
  LeadLastModifiedOn: string;
  OwnerIdName: string;
  OwnerIdEmailAddress: string;
  Groups: string;
  CreatedByName: string;
  ModifiedByName: string;
  Account_CompanyName: string;
  Account_ShortName: string;
  Account_TimeZone: string;
  Account_Website: string;
  Account_Street1: string;
  Account_Street2: string;
  Account_City: string;
  Account_State: string;
  Account_Country: string;
  Account_Zip: string;
  Account_Fax: string;
  Account_Phone: string;
  Owner_FirstName: string;
  Owner_MiddleName: string;
  Owner_LastName: string;
  Owner_EmailAddress: string;
  Owner_FullName: string;
  Owner_TimeZone: string;
  Owner_AssociatedPhoneNumbers: string;
  Org_ShortCode: string;
  Account_Address: string;
  [key: string]: string | number | boolean | null;
};

export type LeadSquaredContactResponse = {
  LeadPropertyList: [
    {
      Attribute: string;
      Value: string;
    },
  ];
};

export type LeadSquaredContactInput = Partial<LeadSquaredContact>;
export type LeadSquaredContactOutput = LeadSquaredContactInput;
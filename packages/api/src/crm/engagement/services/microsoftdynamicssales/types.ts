interface MicrosoftdynamicssalesEmail {
    activityadditionalparams: string;
    activityid: string; // Guid
    activitytypecode: string;
    actualdurationminutes: number;
    actualend: string;
    actualstart: string;
    attachmentcount: number;
    attachmentopencount: number;
    baseconversationindexhash: number;
    category: string;
    community: number;
    compressed: boolean;
    conversationindex: string;
    conversationtrackingid: string; // Guid
    correlatedsubjectchanged: boolean;
    correlationmethod: number;
    createdon: string;
    delayedemailsendtime: string;
    deliveryattempts: number;
    deliverylastattemptedon: string;
    deliveryprioritycode: number;
    deliveryreceiptrequested: boolean;
    description: string;
    descriptionblobid: string; // Binary
    descriptionblobid_name: string;
    directioncode: boolean;
    emailreminderexpirytime: string;
    emailreminderstatus: number;
    emailremindertext: string;
    emailremindertype: number;
    emailtrackingid: string; // Guid
    exchangeitemid: string;
    exchangerate: number;
    exchangeweblink: string;
    followemailuserpreference: boolean;
    formattedscheduledend: string;
    formattedscheduledstart: string;
    importsequencenumber: number;
    inreplyto: string;
    instancetypecode: number;
    internetmessageheaders: string;
    isbilled: boolean;
    isduplicatesenderunresolved: boolean;
    isemailfollowed: boolean;
    isemailreminderset: boolean;
    ismapiprivate: boolean;
    isregularactivity: boolean;
    isunsafe: number;
    isworkflowcreated: boolean;
    lastonholdtime: string;
    lastopenedtime: string;
    leftvoicemail: boolean;
    linksclickedcount: number;
    messageid: string;
    mimetype: string;
    modifiedon: string;
    notifications: number;
    onholdtime: number;
    opencount: number;
    overriddencreatedon: string;
    postponeactivityprocessinguntil: string;
    postponeemailprocessinguntil: string;
    prioritycode: number;
    processid: string; // Guid
    readreceiptrequested: boolean;
    reminderactioncardid: string; // Guid
    replycount: number;
    reservedforinternaluse: string;
    safedescription: string;
    scheduleddurationminutes: number;
    scheduledend: string;
    scheduledstart: string;
    sender: string;
    senton: string;
    seriesid: string; // Guid
    sortdate: string;
    stageid: string; // Guid
    statecode: number;
    statuscode: number;
    subcategory: string;
    subject: string;
    submittedby: string;
    timezoneruleversionnumber: number;
    torecipients: string;
    trackingtoken: string;
    traversedpath: string;
    utcconversiontimezonecode: number;
    versionnumber: number;
    _acceptingentityid_value: string;
    _createdby_value: string;
    _createdonbehalfby_value: string;
    _emailsender_value: string;
    _modifiedby_value: string;
    _modifiedonbehalfby_value: string;
    _ownerid_value: string;
    _owningbusinessunit_value: string;
    _owningteam_value: string;
    _owninguser_value: string;
    _receivingmailboxid_value: string;
    _regardingobjectid_value: string;
    _sendermailboxid_value: string;
    _sendersaccount_value: string;
    _slaid_value: string;
    _slainvokedid_value: string;
    _templateid_value: string;
    _transactioncurrencyid_value: string;
    [key: string]: any;
}

interface MicrosoftdynamicssalesAppointment {
    activityadditionalparams: string;
    activityid: string; // Guid
    activitytypecode: string;
    actualdurationminutes: number;
    actualend: string;
    actualstart: string;
    attachmenterrors: number;
    category: string;
    community: number;
    createdon: string;
    deliverylastattemptedon: string;
    deliveryprioritycode: number;
    description: string;
    descriptionblobid: string; // Binary
    descriptionblobid_name: string;
    exchangeitemid: string;
    exchangerate: number;
    exchangeweblink: string;
    formattedscheduledend: string;
    formattedscheduledstart: string;
    globalobjectid: string;
    importsequencenumber: number;
    instancetypecode: number;
    isalldayevent: boolean;
    isbilled: boolean;
    isdraft: boolean;
    ismapiprivate: boolean;
    isonlinemeeting: boolean;
    isregularactivity: boolean;
    isunsafe: number;
    isworkflowcreated: boolean;
    lastonholdtime: string;
    leftvoicemail: boolean;
    location: string;
    modifiedfieldsmask: string;
    modifiedon: string;
    onholdtime: number;
    onlinemeetingchatid: string;
    onlinemeetingid: string;
    onlinemeetingjoinurl: string;
    onlinemeetingtype: number;
    originalstartdate: string;
    outlookownerapptid: number;
    overriddencreatedon: string;
    postponeactivityprocessinguntil: string;
    prioritycode: number;
    processid: string; // Guid
    scheduleddurationminutes: number;
    scheduledend: string;
    scheduledstart: string;
    senton: string;
    seriesid: string; // Guid
    sortdate: string;
    stageid: string; // Guid
    statecode: number;
    statuscode: number;
    subcategory: string;
    subject: string;
    subscriptionid: string; // Guid
    timezoneruleversionnumber: number;
    traversedpath: string;
    utcconversiontimezonecode: number;
    versionnumber: number;
    _createdby_value: string;
    _createdonbehalfby_value: string;
    _modifiedby_value: string;
    _modifiedonbehalfby_value: string;
    _ownerid_value: string;
    _owningbusinessunit_value: string;
    _owningteam_value: string;
    _owninguser_value: string;
    _regardingobjectid_value: string;
    _sendermailboxid_value: string;
    _slaid_value: string;
    _slainvokedid_value: string;
    _transactioncurrencyid_value: string;
    [key: string]: any;
}

interface MicrosoftdynamicssalesPhoneCall {
    activityadditionalparams: string;
    activityid: string; // Guid
    activitytypecode: string;
    actualdurationminutes: number;
    actualend: string;
    actualstart: string;
    category: string;
    community: number;
    createdon: string;
    deliverylastattemptedon: string;
    deliveryprioritycode: number;
    description: string;
    descriptionblobid: string; // Binary
    descriptionblobid_name: string;
    directioncode: boolean;
    exchangeitemid: string;
    exchangerate: number;
    exchangeweblink: string;
    formattedscheduledend: string;
    formattedscheduledstart: string;
    importsequencenumber: number;
    instancetypecode: number;
    isbilled: boolean;
    ismapiprivate: boolean;
    isregularactivity: boolean;
    isworkflowcreated: boolean;
    lastonholdtime: string;
    leftvoicemail: boolean;
    modifiedon: string;
    onholdtime: number;
    overriddencreatedon: string;
    phonenumber: string;
    postponeactivityprocessinguntil: string;
    prioritycode: number;
    processid: string; // Guid
    scheduleddurationminutes: number;
    scheduledend: string;
    scheduledstart: string;
    senton: string;
    seriesid: string; // Guid
    sortdate: string;
    stageid: string; // Guid
    statecode: number;
    statuscode: number;
    subcategory: string;
    subject: string;
    subscriptionid: string; // Guid
    timezoneruleversionnumber: number;
    traversedpath: string;
    utcconversiontimezonecode: number;
    versionnumber: number;
    _createdby_value: string;
    _createdonbehalfby_value: string;
    _modifiedby_value: string;
    _modifiedonbehalfby_value: string;
    _ownerid_value: string;
    _owningbusinessunit_value: string;
    _owningteam_value: string;
    _owninguser_value: string;
    _regardingobjectid_value: string;
    _sendermailboxid_value: string;
    _slaid_value: string;
    _slainvokedid_value: string;
    _transactioncurrencyid_value: string;
    [key: string]: any;
}

export type MicrosoftdynamicssalesEngagementCallInput = Partial<MicrosoftdynamicssalesPhoneCall>;
export type MicrosoftdynamicssalesEngagementCallOutput = MicrosoftdynamicssalesEngagementCallInput;

export type MicrosoftdynamicssalesEngagementEmailInput = Partial<MicrosoftdynamicssalesEmail>;
export type MicrosoftdynamicssalesEngagementEmailOutput = MicrosoftdynamicssalesEngagementEmailInput;

export type MicrosoftdynamicssalesEngagementAppointmentInput = Partial<MicrosoftdynamicssalesAppointment>;
export type MicrosoftdynamicssalesEngagementAppointmentOutput = MicrosoftdynamicssalesEngagementAppointmentInput;


export type MicrosoftdynamicssalesEngagementInput = MicrosoftdynamicssalesEngagementCallInput
    | MicrosoftdynamicssalesEngagementEmailInput
    | MicrosoftdynamicssalesEngagementAppointmentInput;

export type MicrosoftdynamicssalesEngagementOutput = MicrosoftdynamicssalesEngagementCallOutput
    | MicrosoftdynamicssalesEngagementEmailOutput
    | MicrosoftdynamicssalesEngagementAppointmentOutput;


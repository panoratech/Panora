interface MicrosoftdynamicssalesNote {
    annotationid: string;
    createdon: string;
    documentbody: string;
    documentbody_binary: string;
    filename: string;
    filesize: number;
    importsequencenumber: number;
    isdocument: boolean;
    langid: string;
    mimetype: string;
    modifiedon: string;
    notetext: string;
    objecttypecode: string;
    overriddencreatedon: string;
    prefix: string;
    stepid: string;
    subject: string;
    versionnumber: number;
    _createdby_value: string;
    _createdonbehalfby_value: string;
    _modifiedby_value: string;
    _modifiedonbehalfby_value: string;
    _objectid_value: string;
    _ownerid_value: string;
    _owningbusinessunit_value: string;
    _owningteam_value: string;
    _owninguser_value: string
}

export type MicrosoftdynamicssalesNoteInput = Partial<MicrosoftdynamicssalesNote>;
export type MicrosoftdynamicssalesNoteOutput = MicrosoftdynamicssalesNoteInput;
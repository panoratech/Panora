interface ZohoNote {
  Owner: Owner;
  Created_Time: string;
  Parent_Id: ParentId;
  id: string;
  Note_Title: string | null;
  Note_Content: string;
}

interface Owner {
  name: string;
  id: string;
  email: string;
}

interface Module {
  api_name?: string;
  id?: string;
}

interface ParentId {
  module?: Module;
  name?: string;
  id?: string;
}

export type ZohoNoteInput = Partial<ZohoNote>;
export type ZohoNoteOutput = ZohoNoteInput;

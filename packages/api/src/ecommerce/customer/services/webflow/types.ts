export interface WebflowCustomerInput {
  id: string;
  isEmailVerified: boolean;
  lastUpdated: string;
  invitedOn: string;
  createdOn: string;
  lastLogin: string;
  status: string;
  accessGroups: AccessGroup[];
  data: UserData;
}

type AccessGroup = {
  slug: string;
  type: string;
};

type UserData = {
  name: string;
  email: string;
  'accept-privacy': boolean;
  'accept-communications': boolean;
  [key: string]: any;
};

export type WebflowCustomerOutput = Partial<WebflowCustomerInput>;

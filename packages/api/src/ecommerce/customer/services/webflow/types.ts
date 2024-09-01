// ref: https://docs.developers.webflow.com/data/reference/list-users

export interface WebflowCustomerInput {
  id: string;
  isEmailVerified: boolean;
  lastUpdated: string;
  invitedOn: string;
  createdOn: string;
  lastLogin: string;
  status: 'invited' | 'verified' | 'unverified';
  accessGroups: AccessGroup[];
  data: UserData;
}

type AccessGroup = {
  slug: string;
  type: AccessGroupType;
};

enum AccessGroupType {
  ADMIN = 'admin', // Assigned to the user via API or in the designer
  ECOMMERCE = 'ecommerce', // Assigned to the user via an ecommerce purchase
}

type UserData = {
  name: string;
  email: string;
  acceptPrivacy: boolean;
  acceptCommunications: boolean;
  [key: string]: any;
};

export type WebflowCustomerOutput = Partial<WebflowCustomerInput>;

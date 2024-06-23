export interface dixaUserInput {
  displayName: string;
  email: string;
  phoneNumber: string;
  additionalEmails: string[];
  additionalPhoneNumbers: string[];
  firstName: string;
  lastName: string;
  middleNames: any[];
  avatarUrl: string;
  externalId: string;
}

export interface dixaUserOutput {
  id: string;
  createdAt: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  additionalEmails: string[];
  additionalPhoneNumbers: string[];
  firstName: string;
  lastName: string;
  middleNames: any[];
  avatarUrl: string;
  externalId: string;
  customAttributes: CustomAttribute[];
}

interface CustomAttribute {
  id: string;
  name: string;
  identifier: string;
  value: string;
}

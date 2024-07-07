export interface AshbyCandidateInput {
  id: string;
  createdAt: string;
  name: string;
  primaryEmailAddress: PrimaryEmailAddress;
  emailAddresses: EmailAddress[];
  primaryPhoneNumber: PhoneNumber;
  phoneNumbers: PhoneNumber[];
  socialLinks: SocialLink[];
  tags: Tag[];
  position: string;
  company: string;
  school: string;
  applicationIds: string[];
  resumeFileHandle: ResumeFileHandle;
  fileHandles: FileHandle[];
  customFields: CustomField[];
  profileUrl: string;
  source: {
    id: string;
    title: string;
    isArchived: boolean;
    sourceType: SourceType;
  };
  creditedToUser: CreditedToUser;
  timezone: string;
  primaryLocation: PrimaryLocation;
}

export type AshbyCandidateOutput = Partial<AshbyCandidateInput>;

interface PrimaryEmailAddress {
  value: string;
  type: string;
  isPrimary: boolean;
}

interface EmailAddress {
  value: string;
  type: string;
  isPrimary: boolean;
}

interface PhoneNumber {
  value: string;
  type: string;
  isPrimary: boolean;
}

interface SocialLink {
  url: string;
  type: string;
}

interface Tag {
  id: string;
  title: string;
  isArchived: boolean;
}

interface ResumeFileHandle {
  id: string;
  name: string;
  handle: string;
}

interface FileHandle {
  id: string;
  name: string;
  handle: string;
}

interface CustomField {
  id: string;
  title: string;
  value: string;
}

interface SourceType {
  id: string;
  title: string;
  isArchived: boolean;
}

interface CreditedToUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
  isEnabled: boolean;
  updatedAt: string;
}

interface LocationComponent {
  type: string;
  name: string;
}

interface PrimaryLocation {
  id: string;
  locationSummary: string;
  locationComponents: LocationComponent[];
}
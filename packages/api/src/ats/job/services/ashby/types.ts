export interface AshbyJobInput {
  id: string;
  title: string;
  confidential: boolean;
  status: string;
  employmentType: string;
  locationId: string;
  departmentId: string;
  defaultInterviewPlanId: string;
  interviewPlanIds: string[];
  customFields: CustomField[];
  jobPostingIds: string[];
  customRequisitionId: string;
  hiringTeam: HiringTeam[];
  updatedAt: string;
  openedAt: string;
  closedAt: string;
  location: Location;
  openings: Opening[];
}

export type AshbyJobOutput = Partial<AshbyJobInput>;

export interface CustomField {
  id: string;
  title: string;
  value: string;
}

export interface HiringTeam {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userId: string;
}

export interface Location {
  id: string;
  name: string;
  isArchived: boolean;
  address: Address;
  isRemote: boolean;
}

export interface Address {
  postalAddress: PostalAddress;
}

export interface PostalAddress {
  addressCountry: string;
  addressRegion: string;
  addressLocality: string;
}

export interface Opening {
  id: string;
  openedAt: string;
  closedAt: string;
  isArchived: boolean;
  archivedAt: string;
  openingState: string;
  latestVersion: LatestVersion;
}

// LatestVersion interface
export interface LatestVersion {
  id: string;
  identifier: string;
  description: string;
  authorId: string;
  createdAt: string;
  teamId: string;
  jobIds: string[];
  targetHireDate: string;
  targetStartDate: string;
  isBackfill: boolean;
  employmentType: string;
  locationIds: string[];
  hiringTeam: HiringTeam[];
}

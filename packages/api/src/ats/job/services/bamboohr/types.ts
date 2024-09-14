export interface BamboohrJob {
  id: number;
  title: Title;
  postedDate: string;
  location: Location;
  department: Department;
  status: Status;
  newApplicantsCount?: number;
  activeApplicantsCount?: number;
  totalApplicantsCount: number;
  postingUrl: string;
}

export interface Title {
  id: any;
  label: string;
}

export interface Location {
  id: number;
  label: string;
  address: Address;
}

export interface Address {
  name: string;
  description: any;
  addressLine1: string;
  addressLine2: any;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phoneNumber: any;
}

export interface Department {
  id: number;
  label: string;
}

export interface Status {
  id: number;
  label: string;
}

export type BamboohrJobOutput = Partial<BamboohrJob>;

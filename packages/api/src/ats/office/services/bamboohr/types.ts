export interface BamboohrInput {
  id: string;
  name: string;
  description: any;
  city: string;
  state: State;
  country: Country;
  zipcode: string;
  addressLine1: string;
  addressLine2: any;
  phone: any;
}

export interface State {
  id: string;
  name: string;
  abbrev: string;
  iso_code: string;
}

export interface Country {
  id: string;
  name: string;
  iso_code: string;
}

export type BamboohrOutput = Partial<BamboohrInput>;
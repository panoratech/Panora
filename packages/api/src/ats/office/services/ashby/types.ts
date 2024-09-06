export interface AshbyOfficeInput {
  id: string;
  name: string;
  isArchived: boolean;
  address: Address;
  isRemote: boolean;
}

export type AshbyOfficeOutput = Partial<AshbyOfficeInput>;

export interface AddressPostal {
  addressCountry: string;
  addressRegion: string;
  addressLocality: string;
}

export interface Address {
  postalAddress: AddressPostal;
}

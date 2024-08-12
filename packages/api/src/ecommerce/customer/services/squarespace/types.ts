export interface SquarespaceCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  address: {
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    countryCode: string;
    postalCode: string;
    phone: string;
  };
}

export type SquarespaceCustomerOutput = Partial<SquarespaceCustomerInput>;

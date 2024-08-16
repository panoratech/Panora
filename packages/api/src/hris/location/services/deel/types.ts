export type DeelLocationOutput = Partial<{
  streetAddress: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
  type: 'WORK' | 'HOME';
}>;

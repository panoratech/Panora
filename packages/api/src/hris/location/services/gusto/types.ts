export type GustoLocationOutput = Partial<{
  uuid: string;
  street_1: string;
  street_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  active: boolean;
  type: 'WORK' | 'HOME';
}>;

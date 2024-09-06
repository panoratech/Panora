export type GustoCompanyOutput = Partial<{
  ein: string; // The Federal Employer Identification Number of the company.
  entity_type:
    | 'C-Corporation'
    | 'S-Corporation'
    | 'Sole proprietor'
    | 'LLC'
    | 'LLP'
    | 'Limited partnership'
    | 'Co-ownership'
    | 'Association'
    | 'Trusteeship'
    | 'General partnership'
    | 'Joint venture'
    | 'Non-Profit'; // The tax payer type of the company.
  tier:
    | 'simple'
    | 'plus'
    | 'premium'
    | 'core'
    | 'complete'
    | 'concierge'
    | 'contractor_only'
    | 'basic'
    | null; // The Gusto product tier of the company.
  is_suspended: boolean; // Whether or not the company is suspended in Gusto.
  company_status: 'Approved' | 'Not Approved' | 'Suspended'; // The status of the company in Gusto.
  uuid: string; // A unique identifier of the company in Gusto.
  name: string; // The name of the company.
  slug: string; // The slug of the name of the company.
  trade_name: string; // The trade name of the company.
  is_partner_managed: boolean; // Whether the company is fully managed by a partner via the API
  pay_schedule_type:
    | 'single'
    | 'hourly_salaried'
    | 'by_employee'
    | 'by_department'; // The pay schedule assignment type.
  join_date: string; // Company's first invoiceable event date
  funding_type: 'ach' | 'reverse_wire' | 'wire_in' | 'brex'; // Company's default funding type
  locations: Array<Address & { active: boolean }>; // The locations of the company, with status
  compensations: {
    hourly: CompensationRate[]; // The available hourly compensation rates for the company.
    fixed: CompensationRate[]; // The available fixed compensation rates for the company.
  };
  paid_time_off: PaidTimeOff[]; // The available types of paid time off for the company.
  primary_signatory: Person; // The primary signatory of the company.
  primary_payroll_admin: Omit<Person, 'middle_initial' | 'home_address'>; // The primary payroll admin of the company.
}>;

type Address = {
  street_1: string;
  street_2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string; // Defaults to USA
};

type CompensationRate = {
  name: string;
  multiple?: number; // For hourly compensation
  fixed?: number; // For fixed compensation
};

type PaidTimeOff = {
  name: string;
};

type Person = {
  first_name: string;
  middle_initial?: string;
  last_name: string;
  phone: string;
  email: string;
  home_address?: Address;
};

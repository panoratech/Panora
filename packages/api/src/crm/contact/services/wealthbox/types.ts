export interface WealthboxContactInput {
  prefix?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  nickname?: string;
  job_title?: string;
  company_name?: string;
  twitter_name?: string;
  linkedin_url?: string;
  background_information?: string;
  birth_date?: string;
  anniversary?: string;
  client_since?: string;
  date_of_death?: string;
  assigned_to?: number;
  referred_by?: number;
  type: "Person" | "Company";
  gender?: string;
  contact_source?: string;
  contact_type?: string;
  status?: string;
  marital_status?: string;
  attorney?: number;
  cpa?: number;
  doctor?: number;
  insurance?: number;
  business_manager?: number;
  family_officer?: number;
  assistant?: number;
  other?: number;
  trusted_contact?: number;
  important_information?: string;
  personal_interests?: string;
  investment_objective?: string;
  time_horizon?: string;
  risk_tolerance?: string;
  mutual_fund_experience?: number;
  stocks_and_bonds_experience?: number;
  partnerships_experience?: number;
  other_investing_experience?: number;
  gross_annual_income?: number;
  assets?: number;
  non_liquid_assets?: number;
  liabilities?: number;
  adjusted_gross_income?: number;
  estimated_taxes?: number;
  confirmed_by_tax_return?: boolean;
  tax_year?: number;
  tax_bracket?: number;
  birth_place?: string;
  maiden_name?: string;
  passport_number?: string;
  green_card_number?: string;
  occupation?: {
    name: string;
    start_date?: string;
  };
  drivers_license?: {
    number: string;
    state: string;
    issued_date?: string;
    expires_date?: string;
  };
  retirement_date?: string;
  signed_fee_agreement_date?: string;
  signed_ips_agreement_date?: string;
  signed_fp_agreement_date?: string;
  last_adv_offering_date?: string;
  initial_crs_offering_date?: string;
  last_crs_offering_date?: string;
  last_privacy_offering_date?: string;
  company?: string;
  household?: {
    name: string;
    title?: string;
  };
  tags?: string[];
  street_addresses?: {
    street_line_1: string;
    street_line_2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    principal?: boolean;
    kind?: string;
    destroy?: boolean;
  }[];
  email_addresses?: {
    address: string;
    principal?: boolean;
    kind?: string;
    destroy?: boolean;
  }[];
  phone_numbers?: {
    address: string;
    principal?: boolean;
    extension?: string;
    kind?: string;
    destroy?: boolean;
  }[];
  websites?: {
    address: string;
    principal?: boolean;
    kind?: string;
    destroy?: boolean;
  }[];
  custom_fields?: {
    id: number;
    value: string;
  }[];
  contact_roles?: {
    id: number;
    value: number;
  }[];
  visible_to?: string;
}




interface HouseholdMember {
  id: number;
  first_name: string;
  last_name: string;
  title: string;
  type: "Person" | "Company";
}

interface Household {
  name: string;
  title: string;
  id: number;
  members: HouseholdMember[];
}


export interface WealthboxContactOutput {
  id: number;
  creator: number;
  created_at: string;
  updated_at: string;
  prefix?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  nickname?: string;
  job_title?: string;
  company_name?: string;
  twitter_name?: string;
  linkedin_url?: string;
  background_information?: string;
  birth_date?: string;
  anniversary?: string;
  client_since?: string;
  date_of_death?: string;
  assigned_to?: number;
  referred_by?: number;
  type: "Person" | "Company";
  gender?: string;
  contact_source?: string;
  contact_type?: string;
  status?: string;
  marital_status?: string;
  attorney?: number;
  cpa?: number;
  doctor?: number;
  insurance?: number;
  business_manager?: number;
  family_officer?: number;
  assistant?: number;
  other?: number;
  trusted_contact?: number;
  important_information?: string;
  personal_interests?: string;
  investment_objective?: string;
  time_horizon?: string;
  risk_tolerance?: string;
  mutual_fund_experience?: number;
  stocks_and_bonds_experience?: number;
  partnerships_experience?: number;
  other_investing_experience?: number;
  gross_annual_income?: number;
  assets?: number;
  non_liquid_assets?: number;
  liabilities?: number;
  adjusted_gross_income?: number;
  estimated_taxes?: number;
  confirmed_by_tax_return?: boolean;
  tax_year?: number;
  tax_bracket?: number;
  birth_place?: string;
  maiden_name?: string;
  passport_number?: string;
  green_card_number?: string;
  occupation?: {
    name: string;
    start_date?: string;
  };
  drivers_license?: {
    number: string;
    state: string;
    issued_date?: string;
    expires_date?: string;
  };
  retirement_date?: string;
  signed_fee_agreement_date?: string;
  signed_ips_agreement_date?: string;
  signed_fp_agreement_date?: string;
  last_adv_offering_date?: string;
  initial_crs_offering_date?: string;
  last_crs_offering_date?: string;
  last_privacy_offering_date?: string;
  household?: Household;
  image?: string;
  tags?: {
    id: number;
    name: string;
  }[];
  street_addresses?: {
    street_line_1: string;
    street_line_2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    principal?: boolean;
    kind?: string;
    id?: number;
    address?: string;
  }[];
  email_addresses?: {
    id?: number;
    address: string;
    principal?: boolean;
    kind?: string;
  }[];
  phone_numbers?: {
    id?: number;
    address: string;
    principal?: boolean;
    extension?: string;
    kind?: string;
  }[];
  websites?: {
    id?: number;
    address: string;
    principal?: boolean;
    kind?: string;
  }[];
  custom_fields?: {
    id: number;
    name: string;
    value: string;
    document_type: string;
    field_type: string;
  }[];
  contact_roles?: {
    id: number;
    name: string;
    value: number;
    assigned_to: {
      id: number;
      type: string;
      name: string;
    };
  }[];
}

export const commonWealthboxProperties = {
  id: "",
  contactType: "",
  name: "",
  email: "",
  phone: "",
  active: "",
  tags: "",
  deleted: "",
  householdTitle: "",
  type: "",
  order: "",
}
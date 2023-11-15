export interface ZohoContactInput {
  contact_name: string;
  company_name: string;
  website: string;
  language_code: string;
  contact_type: string;
  customer_sub_type: string;
  credit_limit: number;
  tags: { tag_id: number; tag_option_id: number }[];
  is_portal_enabled: boolean;
  currency_id: number;
  payment_terms: number;
  payment_terms_label: string;
  notes: string;
  billing_address: Address;
  shipping_address: Address;
  contact_persons: string;
  default_templates: DefaultTemplates;
  custom_fields: CustomFieldInput[];
  opening_balance_amount: number;
  exchange_rate: number;
  vat_reg_no: string;
  owner_id: number;
  tax_reg_no: number;
  country_code: string;
  vat_treatment: string;
  tax_treatment: string;
  tax_regime: string;
  is_tds_registered: boolean;
  place_of_contact: string;
  gst_no: string;
  gst_treatment: string;
  tax_authority_name: string;
  avatax_exempt_no: string;
  avatax_use_code: string;
  tax_exemption_id: number;
  tax_exemption_code: string;
  tax_authority_id: number;
  tax_id: number;
  tds_tax_id: string;
  is_taxable: boolean;
  facebook: string;
  twitter: string;
  track_1099: boolean;
  tax_id_type: string;
  tax_id_value: string;
}

export interface ZohoContactOutput {
  contact_id: number;
  contact_name: string;
  company_name: string;
  has_transaction: boolean;
  contact_type: string;
  customer_sub_type: string;
  credit_limit: number;
  is_portal_enabled: boolean;
  language_code: string;
  is_taxable: boolean;
  tax_id: number;
  tds_tax_id: string;
  tax_name: string;
  tax_percentage: number;
  tax_authority_id: number;
  tax_exemption_id: number;
  tax_authority_name: string;
  tax_exemption_code: string;
  place_of_contact: string;
  gst_no: string;
  vat_treatment: string;
  tax_treatment: string;
  tax_regime: string;
  is_tds_registered: boolean;
  gst_treatment: string;
  is_linked_with_zohocrm: boolean;
  website: string;
  owner_id: number;
  primary_contact_id: number;
  payment_terms: number;
  payment_terms_label: string;
  currency_id: number;
  currency_code: string;
  currency_symbol: string;
  opening_balance_amount: number;
  exchange_rate: number;
  outstanding_receivable_amount: number;
  outstanding_receivable_amount_bcy: number;
  unused_credits_receivable_amount: number;
  unused_credits_receivable_amount_bcy: number;
  status: string;
  payment_reminder_enabled: boolean;
  custom_fields: CustomFieldOutput[];
  billing_address: Address;
  shipping_address: Address;
  facebook: string;
  twitter: string;
  contact_persons: ContactPerson[];
  default_templates: DefaultTemplates;
  notes: string;
  created_time: string;
  last_modified_time: string;
}

//OUTPUT

interface CustomFieldOutput {
  index: number;
  value: string;
  label: string;
}

interface Address {
  attention: string;
  address: string;
  street2: string;
  state_code: string;
  city: string;
  state: string;
  zip: number;
  country: string;
  fax: string;
  phone: string;
}

interface ContactPerson {
  contact_person_id: number;
  salutation: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  designation: string;
  department: string;
  skype: string;
  is_primary_contact: boolean;
  enable_portal: boolean;
}

//INPUT

interface DefaultTemplates {
  invoice_template_id: number;
  estimate_template_id: number;
  creditnote_template_id: number;
  purchaseorder_template_id: number;
  salesorder_template_id: number;
  retainerinvoice_template_id: number;
  paymentthankyou_template_id: number;
  retainerinvoice_paymentthankyou_template_id: number;
  invoice_email_template_id: number;
  estimate_email_template_id: number;
  creditnote_email_template_id: number;
  purchaseorder_email_template_id: number;
  salesorder_email_template_id: number;
  retainerinvoice_email_template_id: number;
  paymentthankyou_email_template_id: number;
  retainerinvoice_paymentthankyou_email_template_id: number;
}

interface CustomFieldInput {
  index: number;
  value: string;
}

export type FrontAccountInput = {
  id: string;
};

export type FrontAccountOutput = {
  _links: {
    self: string;
    related: {
      contacts: string;
    };
  };
  id: string;
  name: string;
  logo_url: string;
  description: string;
  domains: string[][];
  external_id: number;
  custom_fields: {
    employees: number;
    headquarters: string;
  };
  created_at: number;
  updated_at: number;
};

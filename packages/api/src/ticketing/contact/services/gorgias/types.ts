export type GorgiasContactOutput = {
  id: number;
  created_datetime: string; // ISO 8601 datetime format
  email: string; // Assuming email validation occurs elsewhere
  external_id: string;
  firstname: string;
  language: string; // ISO_639-1 format
  lastname: string;
  name: string;
  timezone: string; // IANA timezone name
  updated_datetime: string; // ISO 8601 datetime format
};

export type GorgiasContactInput = Partial<GorgiasContactOutput>;

export type GorgiasUserOutput = {
  id: number;
  active: boolean;
  bio: string;
  created_datetime: string; // ISO 8601 datetime format
  country: string; // ISO 3166-1 alpha-2 country code
  deactivated_datetime: string | null; // ISO 8601 datetime, nullable if the user is active
  email: string; // Assuming validation is handled elsewhere
  external_id: string;
  firstname: string;
  lastname: string;
  language: string; // ISO language code
  meta: Meta; // Key-value storage for additional user data
  name: string;
  role: UserRole;
  timezone: string; // IANA timezone name
  updated_datetime: string;
};

export type GorgiasUserInput = Partial<GorgiasUserOutput>;

interface Meta {
  [key: string]: any; // Flexible key-value store for additional structured information
}

interface UserRole {
  id: number;
  name: string;
  permissions: string[]; // Example: Array of permission identifiers
}

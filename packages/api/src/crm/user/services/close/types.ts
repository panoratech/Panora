export interface CloseUserInput {
  [key: string]: any;
}

export interface CloseUserOutput {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  image: string;
  organizations: string[];
  date_created: string;
  date_updated: string;
}

export interface BambooUser {
  id: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  lastLogin: string;
}
export interface BamboohrUserOutput {
  [index: string]: BambooUser;
}

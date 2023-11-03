export class CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
}

export type LoginCredentials = {
  id_user?: number;
  email?: string;
  password_hash: string;
};

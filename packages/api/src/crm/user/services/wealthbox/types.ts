interface AccountUser{
  id: number,
  email: string,
  name: string,
  account: number
}

interface Account {
  id: number,
  name: string,
  created_at: Date
}

interface AccountUser  {
  id: number,
  email: string,
  name: string,
  account: number
}

export interface WealthBoxUser{
  id: number,
  name: string,
  first_name: string
  last_name: string,
  email: string,
  plan: string,
  created_at: Date,
  updated_at: Date,
  current_user: AccountUser,
  accounts: Account[],
  users: AccountUser [],
  [key: string]: any;
}

export type WealthBoxUserInput = Partial<WealthBoxUser>;
export type WealthBoxUserOutput = WealthBoxUserInput;
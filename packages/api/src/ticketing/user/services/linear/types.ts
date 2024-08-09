interface LinearUser {
  id: string
  name: string
  email: string
}

export type LinearUserInput = Partial<LinearUser>;
export type LinearUserOutput = LinearUserInput;

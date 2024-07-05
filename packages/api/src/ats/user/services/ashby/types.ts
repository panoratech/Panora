export interface AshbyUserInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
  isEnabled: boolean;
  updatedAt: string;
}

export type AshbyUserOutput = Partial<AshbyUserInput>;

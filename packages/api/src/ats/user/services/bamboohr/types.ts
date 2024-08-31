export interface BamboohrUserInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
  isEnabled: boolean;
  updatedAt: string;
}

export type BamboohrUserOutput = Partial<BamboohrUserInput>;

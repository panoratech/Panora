export interface AshbyActivityInput {
  id: string;
  createdAt: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type AshbyActivityOutput = Partial<AshbyActivityInput>;

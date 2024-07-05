export interface AshbyTagInput {
  id: string;
  title: string;
  isArchived: boolean;
}

export type AshbyTagOutput = Partial<AshbyTagInput>;

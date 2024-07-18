export interface AshbyDepartmentInput {
  id: string;
  name: string;
  isArchived: boolean;
  parentId: string;
}

export type AshbyDepartmentOutput = Partial<AshbyDepartmentInput>;

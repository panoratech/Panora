export interface AshbyRejectReasonInput {
  id: string;
  text: string;
  reasonType: string;
  isArchived: boolean;
}

export type AshbyRejectReasonOutput = Partial<AshbyRejectReasonInput>;

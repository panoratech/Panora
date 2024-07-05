export interface AshbyJobInterviewStageInput {
  id: string;
  title: string;
  type: string;
  orderInInterviewPlan: number;
  interviewStageGroupId: string;
  interviewPlanId: string;
}

export type AshbyJobInterviewStageOutput = Partial<AshbyJobInterviewStageInput>;

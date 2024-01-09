export interface ZendeskStage {
  id: number; // The unique identifier of the stage
  name?: string; // Human-friendly name of the stage
  category?: string; // The unique category name of the stage
  active?: boolean; // Indicator whether or not the stage contains finalized deals
  position?: number; // The stage's position in the pipeline
  likelihood?: number; // The likelihood that a deal will be won, set for the stage as a percentage
  pipeline_id?: number; // Unique identifier of the pipeline that contains this stage
  created_at: string; // Date and time of creation in UTC ISO8601 format
  updated_at: string; // Date and
}

export type ZendeskStageInput = Partial<ZendeskStage>;
export type ZendeskStageOutput = ZendeskStageInput;

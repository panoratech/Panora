export interface PipedriveStage {
  id: number;
  order_nr: number;
  name: string;
  active_flag: boolean;
  deal_probability: number;
  pipeline_id: number;
  rotten_flag: boolean;
  rotten_days: number;
  add_time: string;
  update_time: string;
  pipeline_name: string;
  pipeline_deal_probability: boolean;
  [key: string]: any;
}

export type PipedriveStageInput = Partial<PipedriveStage>;
export type PipedriveStageOutput = PipedriveStageInput;

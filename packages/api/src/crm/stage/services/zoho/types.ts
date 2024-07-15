export interface ZohoStage {
  Stage_Name: string;
  [key: string]: any;
}

export type ZohoStageInput = Partial<ZohoStage>;
export type ZohoStageOutput = ZohoStageInput;

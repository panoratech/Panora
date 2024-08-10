export interface RedtailOpportunity {
  id: string;
  title: string;
  description: string;
  amount: number;
  probability: number;
  stage: string;
  close_date: Date;
  create_date: Date;
  update_date: Date;
  owner_id: {
    id: number;
    name: string;
    email: string;
    has_pic: number;
    pic_hash: string;
    active_flag: boolean;
    value: number;
  };
  company_id: number;
  contact_id: string;
  related_deals_count: number;
  won_deals_count: number;
  lost_deals_count: number;
  active_flag: boolean;
  projected_revenue?: number;
  actual_revenue?: number;
  deleted?: boolean;
  [key: string]: any;
}

export type RedtailOpportunityInput = Partial<RedtailOpportunity>;
export type RedtailOpportunityOutput = RedtailOpportunity;

export const commonOpportunityRedtailProperties = {
  defaultStage: 'Prospecting',
  defaultProbability: 0.1,
};

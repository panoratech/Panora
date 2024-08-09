interface Amount {
  amount?:  number,
  currency?: string,
  kind?: string

}

interface document {
  id : number,
  type: string,
  name?: string,
}

interface CustomFieldRequest {
  id : number,
  value: string 
}
export interface WealthBoxDealInput
{
  name: string,
  description?: string,
  target_close: Date,
  probability: number,
  stage: number,
  manager?: number,
  amounts: Amount[],
  linked_to?: document[],
  visible_to?: string,
  custom_fields?: CustomFieldRequest[]
}

interface CustomField{
  id: number,
  name:string,
  value: string,
  document_type: string,
  field_type: string
}
export interface WealthBoxDealOutput {
  id?: number,
  creator?: number,
  created_at?: Date,
  updated_at?: Date,
  name: string,
  description?: string,
  target_close: Date,
  probability: number,
  stage: number,
  manager?: number,
  amounts: Amount[],
  linked_to?: document[],
  visible_to: string,
  custom_fields: [
    
  ]
}


export const commonDealWealthBoxProperties = {
  resource_id: "",

};
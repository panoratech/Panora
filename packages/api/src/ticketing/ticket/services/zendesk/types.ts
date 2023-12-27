export interface ZendeskTicket {
  custom_fields: Record<string, any>;
}

export type ZendeskTicketInput = Partial<ZendeskTicket>;
export type ZendeskTicketOutput = ZendeskTicketInput;

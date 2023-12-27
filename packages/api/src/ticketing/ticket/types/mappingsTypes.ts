import { ZendeskTicketMapper } from '../services/zendesk/mappers';

const zendeskTicketMapper = new ZendeskTicketMapper();

export const ticketUnificationMapping = {
  zendesk: {
    unify: zendeskTicketMapper.unify,
    desunify: zendeskTicketMapper.desunify,
  },
};

import { FrontTicketMapper } from '../services/front/mappers';
import { GithubTicketMapper } from '../services/github/mappers';
import { HubspotTicketMapper } from '../services/hubspot/mappers';
import { ZendeskTicketMapper } from '../services/zendesk/mappers';

const zendeskTicketMapper = new ZendeskTicketMapper();
const frontTicketMapper = new FrontTicketMapper();
const githubTicketMapper = new GithubTicketMapper();
const hubspotTicketMapper = new HubspotTicketMapper();

export const ticketUnificationMapping = {
  zendesk: {
    unify: zendeskTicketMapper.unify,
    desunify: zendeskTicketMapper.desunify,
  },
  front: {
    unify: frontTicketMapper.unify,
    desunify: frontTicketMapper.desunify,
  },
  github: {
    unify: githubTicketMapper.unify,
    desunify: githubTicketMapper.desunify,
  },
  hubspot: {
    unify: hubspotTicketMapper.unify,
    desunify: hubspotTicketMapper.desunify,
  },
};

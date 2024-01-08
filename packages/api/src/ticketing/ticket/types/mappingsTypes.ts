import { FrontTicketMapper } from '../services/front/mappers';
import { GithubTicketMapper } from '../services/github/mappers';
import { HubspotTicketMapper } from '../services/hubspot/mappers';
import { ZendeskTicketMapper } from '../services/zendesk/mappers';

const zendeskTicketMapper = new ZendeskTicketMapper();
const frontTicketMapper = new FrontTicketMapper();
const githubTicketMapper = new GithubTicketMapper();
const hubspotTicketMapper = new HubspotTicketMapper();

export const ticketUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskTicketMapper.unify.bind(zendeskTicketMapper),
    desunify: zendeskTicketMapper.desunify,
  },
  front: {
    unify: frontTicketMapper.unify.bind(frontTicketMapper),
    desunify: frontTicketMapper.desunify,
  },
  github: {
    unify: githubTicketMapper.unify.bind(githubTicketMapper),
    desunify: githubTicketMapper.desunify,
  },
  hubspot: {
    unify: hubspotTicketMapper.unify.bind(hubspotTicketMapper),
    desunify: hubspotTicketMapper.desunify,
  },
};

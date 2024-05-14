import { GitlabTicketMapper } from '../services/gitlab/mappers';
import { JiraTicketMapper } from '../services/jira/mappers';
import { FrontTicketMapper } from '../services/front/mappers';
import { GithubTicketMapper } from '../services/github/mappers';
import { GorgiasTicketMapper } from '../services/gorgias/mappers';
import { HubspotTicketMapper } from '../services/hubspot/mappers';
import { ZendeskTicketMapper } from '../services/zendesk/mappers';
import { GitlabTicketMapper } from '../services/gitlab/mappers';
import { JiraTicketMapper } from '../services/jira/mappers';

const zendeskTicketMapper = new ZendeskTicketMapper();
const frontTicketMapper = new FrontTicketMapper();
const githubTicketMapper = new GithubTicketMapper();
const hubspotTicketMapper = new HubspotTicketMapper();
const gorgiasTicketMapper = new GorgiasTicketMapper();

const gitlabTicketMapper = new GitlabTicketMapper();
const jiraTicketMapper = new JiraTicketMapper();
export const ticketUnificationMapping = {
  zendesk: {
    unify: zendeskTicketMapper.unify.bind(zendeskTicketMapper),
    desunify: zendeskTicketMapper.desunify.bind(zendeskTicketMapper),
  },
  front: {
    unify: frontTicketMapper.unify.bind(frontTicketMapper),
    desunify: frontTicketMapper.desunify.bind(frontTicketMapper),
  },
  github: {
    unify: githubTicketMapper.unify.bind(githubTicketMapper),
    desunify: githubTicketMapper.desunify.bind(githubTicketMapper),
  },
  hubspot: {
    unify: hubspotTicketMapper.unify.bind(hubspotTicketMapper),
    desunify: hubspotTicketMapper.desunify.bind(hubspotTicketMapper),
  },
  gorgias: {
    unify: gorgiasTicketMapper.unify.bind(gorgiasTicketMapper),
    desunify: gorgiasTicketMapper.desunify.bind(gorgiasTicketMapper),
  },
  gitlab: {
    unify: gitlabTicketMapper.unify.bind(gitlabTicketMapper),
    desunify: gitlabTicketMapper.desunify.bind(gitlabTicketMapper),
  },
  jira: {
    unify: jiraTicketMapper.unify.bind(jiraTicketMapper),
    desunify: jiraTicketMapper.desunify.bind(jiraTicketMapper),
  },
};

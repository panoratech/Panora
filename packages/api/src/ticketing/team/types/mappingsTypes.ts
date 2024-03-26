import { ClickupteamMapper } from '../services/clickup/mappers';
import { FrontteamMapper } from '../services/front/mappers';
import { GithubteamMapper } from '../services/github/mappers';
import { GorgiasteamMapper } from '../services/gorgias/mappers';
import { JirateamMapper } from '../services/jira/mappers';
import { ClickupTeamMapper } from '../services/clickup/mappers';
import { JiraTeamMapper } from '../services/jira/mappers';
import { FrontTeamMapper } from '../services/front/mappers';
import { GithubTeamMapper } from '../services/github/mappers';
import { GorgiasTeamMapper } from '../services/gorgias/mappers';
import { ZendeskTeamMapper } from '../services/zendesk/mappers';

const zendeskTeamMapper = new ZendeskTeamMapper();
const frontTeamMapper = new FrontTeamMapper();
const githubTeamMapper = new GithubTeamMapper();
const gorgiasTeamMapper = new GorgiasTeamMapper();
const jiraTeamMapper = new JiraTeamMapper();

const clickupTeamMapper = new ClickupTeamMapper();

const clickupteamMapper = new ClickupteamMapper();
const frontteamMapper = new FrontteamMapper();
const githubteamMapper = new GithubteamMapper();
const gorgiasteamMapper = new GorgiasteamMapper();
const jirateamMapper = new JirateamMapper();
export const teamUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskTeamMapper.unify.bind(zendeskTeamMapper),
    desunify: zendeskTeamMapper.desunify,
  },
  front: {
    unify: frontTeamMapper.unify.bind(frontTeamMapper),
    desunify: frontTeamMapper.desunify,
  },
  github: {
    unify: githubTeamMapper.unify.bind(githubTeamMapper),
    desunify: githubTeamMapper.desunify,
  },
  gorgias: {
    unify: gorgiasTeamMapper.unify.bind(gorgiasTeamMapper),
    desunify: gorgiasTeamMapper.desunify,
  },
  jira: {
    unify: jiraTeamMapper.unify.bind(jiraTeamMapper),
    desunify: jiraTeamMapper.desunify,
  },
  clickup: {
    unify: clickupTeamMapper.unify.bind(clickupTeamMapper),
    desunify: clickupTeamMapper.desunify,
  },
};

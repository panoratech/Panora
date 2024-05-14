import { GitlabUserMapper } from '../services/gitlab/mappers';
import { GorgiasUserMapper } from '../services/gorgias/mappers';
import { JiraUserMapper } from '../services/jira/mappers';
import { FrontUserMapper } from '../services/front/mappers';
import { ZendeskUserMapper } from '../services/zendesk/mappers';

const zendeskUserMapper = new ZendeskUserMapper();
const frontUserMapper = new FrontUserMapper();
const gitlabUserMapper = new GitlabUserMapper();

const gorgiasUserMapper = new GorgiasUserMapper();
const jiraUserMapper = new JiraUserMapper();
export const userUnificationMapping = {
  zendesk: {
    unify: zendeskUserMapper.unify.bind(zendeskUserMapper),
    desunify: zendeskUserMapper.desunify,
  },
  front: {
    unify: frontUserMapper.unify.bind(frontUserMapper),
    desunify: frontUserMapper.desunify,
  },
  gitlab: {
    unify: gitlabUserMapper.unify.bind(gitlabUserMapper),
    desunify: gitlabUserMapper.desunify.bind(gitlabUserMapper),
  },
  gorgias: {
    unify: gorgiasUserMapper.unify.bind(gorgiasUserMapper),
    desunify: gorgiasUserMapper.desunify,
  },
  jira: {
    unify: jiraUserMapper.unify.bind(jiraUserMapper),
    desunify: jiraUserMapper.desunify.bind(jiraUserMapper),
  },
};

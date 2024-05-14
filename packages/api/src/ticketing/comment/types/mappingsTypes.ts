import { FrontCommentMapper } from '../services/front/mappers';
import { GorgiasCommentMapper } from '../services/gorgias/mappers';
import { ZendeskCommentMapper } from '../services/zendesk/mappers';
import { GitlabCommentMapper } from '../services/gitlab/mappers';
import { JiraCommentMapper } from '../services/jira/mappers';

const zendeskCommentMapper = new ZendeskCommentMapper();
const frontCommentMapper = new FrontCommentMapper();
const gorgiasCommentMapper = new GorgiasCommentMapper();
const gitlabCommentMapper = new GitlabCommentMapper();
const jiraCommentMapper = new JiraCommentMapper();

export const commentUnificationMapping = {
  zendesk: {
    unify: zendeskCommentMapper.unify.bind(zendeskCommentMapper),
    desunify: zendeskCommentMapper.desunify.bind(zendeskCommentMapper),
  },
  front: {
    unify: frontCommentMapper.unify.bind(frontCommentMapper),
    desunify: frontCommentMapper.desunify.bind(gorgiasCommentMapper),
  },
  gorgias: {
    unify: gorgiasCommentMapper.unify.bind(gorgiasCommentMapper),
    desunify: gorgiasCommentMapper.desunify.bind(gorgiasCommentMapper),
  },
  gitlab: {
    unify: jiraCommentMapper.unify.bind(gitlabCommentMapper),
    desunify: jiraCommentMapper.desunify.bind(gitlabCommentMapper),
  },
  jira: {
    unify: jiraCommentMapper.unify.bind(jiraCommentMapper),
    desunify: jiraCommentMapper.desunify.bind(jiraCommentMapper),
  },
};

import { GitlabCommentMapper } from '../services/gitlab/mappers';
import { JiraCommentMapper } from '../services/jira/mappers';
import { FrontCommentMapper } from '../services/front/mappers';
import { GorgiasCommentMapper } from '../services/gorgias/mappers';
import { ZendeskCommentMapper } from '../services/zendesk/mappers';

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
    desunify: frontCommentMapper.desunify.bind(frontCommentMapper),
  },
  gorgias: {
    unify: gorgiasCommentMapper.unify.bind(gorgiasCommentMapper),
    desunify: gorgiasCommentMapper.desunify.bind(gorgiasCommentMapper),
  },
  gitlab: {
    unify: gitlabCommentMapper.unify.bind(gitlabCommentMapper),
    desunify: gitlabCommentMapper.desunify.bind(gitlabCommentMapper),
  },
  jira: {
    unify: jiraCommentMapper.unify.bind(jiraCommentMapper),
    desunify: jiraCommentMapper.desunify.bind(jiraCommentMapper),
  },
};

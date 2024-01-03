import { FrontCommentMapper } from '../services/front/mappers';
import { GithubCommentMapper } from '../services/github/mappers';
import { ZendeskCommentMapper } from '../services/zendesk/mappers';

const zendeskCommentMapper = new ZendeskCommentMapper();
const githubCommentMapper = new GithubCommentMapper();
const frontCommentMapper = new FrontCommentMapper();

export const commentUnificationMapping = {
  zendesk: {
    unify: zendeskCommentMapper.unify,
    desunify: zendeskCommentMapper.desunify,
  },
  front: {
    unify: frontCommentMapper.unify,
    desunify: frontCommentMapper.desunify,
  },
  github: {
    unify: githubCommentMapper.unify,
    desunify: githubCommentMapper.desunify,
  },
};

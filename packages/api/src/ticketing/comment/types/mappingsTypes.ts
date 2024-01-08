import { FrontCommentMapper } from '../services/front/mappers';
import { GithubCommentMapper } from '../services/github/mappers';
import { ZendeskCommentMapper } from '../services/zendesk/mappers';

const zendeskCommentMapper = new ZendeskCommentMapper();
const githubCommentMapper = new GithubCommentMapper();
const frontCommentMapper = new FrontCommentMapper();

export const commentUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskCommentMapper.unify.bind(zendeskCommentMapper),
    desunify: zendeskCommentMapper.desunify,
  },
  front: {
    unify: frontCommentMapper.unify.bind(frontCommentMapper),
    desunify: frontCommentMapper.desunify,
  },
  github: {
    unify: githubCommentMapper.unify.bind(githubCommentMapper),
    desunify: githubCommentMapper.desunify,
  },
};

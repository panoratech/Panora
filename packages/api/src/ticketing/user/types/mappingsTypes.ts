import { FrontUserMapper } from '../services/front/mappers';
import { GithubUserMapper } from '../services/github/mappers';
import { ZendeskUserMapper } from '../services/zendesk/mappers';

const zendeskUserMapper = new ZendeskUserMapper();
const frontUserMapper = new FrontUserMapper();
const githubUserMapper = new GithubUserMapper();

export const userUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskUserMapper.unify.bind(zendeskUserMapper),
    desunify: zendeskUserMapper.desunify,
  },
  front: {
    unify: frontUserMapper.unify.bind(frontUserMapper),
    desunify: frontUserMapper.desunify,
  },
  github: {
    unify: githubUserMapper.unify.bind(githubUserMapper),
    desunify: githubUserMapper.desunify,
  },
};

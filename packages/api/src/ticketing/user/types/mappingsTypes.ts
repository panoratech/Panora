import { FrontUserMapper } from '../services/front/mappers';
import { GithubUserMapper } from '../services/github/mappers';
import { ZendeskUserMapper } from '../services/zendesk/mappers';

const zendeskUserMapper = new ZendeskUserMapper();
const frontUserMapper = new FrontUserMapper();
const githubUserMapper = new GithubUserMapper();

export const userUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskUserMapper.unify,
    desunify: zendeskUserMapper.desunify,
  },
  front: {
    unify: frontUserMapper.unify,
    desunify: frontUserMapper.desunify,
  },
  github: {
    unify: githubUserMapper.unify,
    desunify: githubUserMapper.desunify,
  },
};

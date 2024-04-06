import { FrontAccountMapper } from '../services/front/mappers';
import { GithubAccountMapper } from '../services/github/mappers';
import { ZendeskAccountMapper } from '../services/zendesk/mappers';

const zendeskAccountMapper = new ZendeskAccountMapper();
const frontAccountMapper = new FrontAccountMapper();
const githubAccountMapper = new GithubAccountMapper();

export const accountUnificationMapping = {
  zendesk: {
    unify: zendeskAccountMapper.unify.bind(zendeskAccountMapper),
    desunify: zendeskAccountMapper.desunify,
  },
  front: {
    unify: frontAccountMapper.unify.bind(frontAccountMapper),
    desunify: frontAccountMapper.desunify,
  },
  github: {
    unify: githubAccountMapper.unify.bind(githubAccountMapper),
    desunify: githubAccountMapper.desunify,
  },
};

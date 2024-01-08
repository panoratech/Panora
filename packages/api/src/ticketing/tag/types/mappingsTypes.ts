import { FrontTagMapper } from '../services/front/mappers';
import { GithubTagMapper } from '../services/github/mappers';
import { ZendeskTagMapper } from '../services/zendesk/mappers';

const zendeskTagMapper = new ZendeskTagMapper();
const frontTagMapper = new FrontTagMapper();
const githubTagMapper = new GithubTagMapper();

export const tagUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskTagMapper.unify.bind(zendeskTagMapper),
    desunify: zendeskTagMapper.desunify,
  },
  front: {
    unify: frontTagMapper.unify.bind(frontTagMapper),
    desunify: frontTagMapper.desunify,
  },
  github: {
    unify: githubTagMapper.unify.bind(githubTagMapper),
    desunify: githubTagMapper.desunify,
  },
};

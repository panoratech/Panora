import { FrontTagMapper } from '../services/front/mappers';
import { GithubTagMapper } from '../services/github/mappers';
import { ZendeskTagMapper } from '../services/zendesk/mappers';

const zendeskTagMapper = new ZendeskTagMapper();
const frontTagMapper = new FrontTagMapper();
const githubTagMapper = new GithubTagMapper();

export const tagUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskTagMapper.unify,
    desunify: zendeskTagMapper.desunify,
  },
  front: {
    unify: frontTagMapper.unify,
    desunify: frontTagMapper.desunify,
  },
  github: {
    unify: githubTagMapper.unify,
    desunify: githubTagMapper.desunify,
  },
};

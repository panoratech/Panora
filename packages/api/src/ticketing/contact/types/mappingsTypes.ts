import { FrontContactMapper } from '../services/front/mappers';
import { GithubContactMapper } from '../services/github/mappers';
import { ZendeskContactMapper } from '../services/zendesk/mappers';

const zendeskContactMapper = new ZendeskContactMapper();
const frontContactMapper = new FrontContactMapper();
const githubContactMapper = new GithubContactMapper();

export const accountUnificationMapping = {
  zendesk: {
    unify: zendeskContactMapper.unify,
    desunify: zendeskContactMapper.desunify,
  },
  front: {
    unify: frontContactMapper.unify,
    desunify: frontContactMapper.desunify,
  },
  github: {
    unify: githubContactMapper.unify,
    desunify: githubContactMapper.desunify,
  },
};

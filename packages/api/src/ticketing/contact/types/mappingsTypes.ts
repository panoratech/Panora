import { FrontContactMapper } from '../services/front/mappers';
import { GithubContactMapper } from '../services/github/mappers';
import { ZendeskContactMapper } from '../services/zendesk/mappers';

const zendeskContactMapper = new ZendeskContactMapper();
const frontContactMapper = new FrontContactMapper();
const githubContactMapper = new GithubContactMapper();

export const contactUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskContactMapper.unify.bind(zendeskContactMapper),
    desunify: zendeskContactMapper.desunify,
  },
  front: {
    unify: frontContactMapper.unify.bind(frontContactMapper),
    desunify: frontContactMapper.desunify,
  },
  github: {
    unify: githubContactMapper.unify.bind(githubContactMapper),
    desunify: githubContactMapper.desunify,
  },
};

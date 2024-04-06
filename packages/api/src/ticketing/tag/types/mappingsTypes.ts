import { FrontTagMapper } from '../services/front/mappers';
import { GithubTagMapper } from '../services/github/mappers';
import { GorgiasTagMapper } from '../services/gorgias/mappers';
import { ZendeskTagMapper } from '../services/zendesk/mappers';

const zendeskTagMapper = new ZendeskTagMapper();
const frontTagMapper = new FrontTagMapper();
const githubTagMapper = new GithubTagMapper();
const gorgiasTagMapper = new GorgiasTagMapper();

export const tagUnificationMapping = {
  zendesk: {
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
  gorgias: {
    unify: gorgiasTagMapper.unify.bind(gorgiasTagMapper),
    desunify: gorgiasTagMapper.desunify,
  },
};

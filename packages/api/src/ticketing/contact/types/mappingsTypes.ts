import { FrontContactMapper } from '../services/front/mappers';
import { GithubContactMapper } from '../services/github/mappers';
import { GorgiasContactMapper } from '../services/gorgias/mappers';
import { ZendeskContactMapper } from '../services/zendesk/mappers';

const zendeskContactMapper = new ZendeskContactMapper();
const frontContactMapper = new FrontContactMapper();
const githubContactMapper = new GithubContactMapper();
const gorgiasContactMapper = new GorgiasContactMapper();

export const contactUnificationMapping = {
  zendesk: {
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
  gorgias: {
    unify: gorgiasContactMapper.unify.bind(gorgiasContactMapper),
    desunify: gorgiasContactMapper.desunify,
  },
};

import { FrontTeamMapper } from '../services/front/mappers';
import { GithubTeamMapper } from '../services/github/mappers';
import { GorgiasTeamMapper } from '../services/gorgias/mappers';
import { ZendeskTeamMapper } from '../services/zendesk/mappers';

const zendeskTeamMapper = new ZendeskTeamMapper();
const frontTeamMapper = new FrontTeamMapper();
const githubTeamMapper = new GithubTeamMapper();
const gorgiasTeamMapper = new GorgiasTeamMapper();

export const teamUnificationMapping = {
  zendesk_tcg: {
    unify: zendeskTeamMapper.unify.bind(zendeskTeamMapper),
    desunify: zendeskTeamMapper.desunify,
  },
  front: {
    unify: frontTeamMapper.unify.bind(frontTeamMapper),
    desunify: frontTeamMapper.desunify,
  },
  github: {
    unify: githubTeamMapper.unify.bind(githubTeamMapper),
    desunify: githubTeamMapper.desunify,
  },
  gorgias: {
    unify: gorgiasTeamMapper.unify.bind(gorgiasTeamMapper),
    desunify: gorgiasTeamMapper.desunify,
  },
};

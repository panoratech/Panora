import { FrontTeamMapper } from '../services/front/mappers';
import { GithubTeamMapper } from '../services/github/mappers';
import { ZendeskTeamMapper } from '../services/zendesk/mappers';

const zendeskTeamMapper = new ZendeskTeamMapper();
const frontTeamMapper = new FrontTeamMapper();
const githubTeamMapper = new GithubTeamMapper();

export const teamUnificationMapping = {
  zendesk: {
    unify: zendeskTeamMapper.unify,
    desunify: zendeskTeamMapper.desunify,
  },
  front: {
    unify: frontTeamMapper.unify,
    desunify: frontTeamMapper.desunify,
  },
  github: {
    unify: githubTeamMapper.unify,
    desunify: githubTeamMapper.desunify,
  },
};

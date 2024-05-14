import { JiraTagMapper } from '../services/jira/mappers';
import { FrontTagMapper } from '../services/front/mappers';
import { GorgiasTagMapper } from '../services/gorgias/mappers';
import { ZendeskTagMapper } from '../services/zendesk/mappers';

const zendeskTagMapper = new ZendeskTagMapper();
const frontTagMapper = new FrontTagMapper();
const gorgiasTagMapper = new GorgiasTagMapper();

const jiraTagMapper = new JiraTagMapper();

export const tagUnificationMapping = {
  zendesk: {
    unify: zendeskTagMapper.unify.bind(zendeskTagMapper),
    desunify: zendeskTagMapper.desunify,
  },
  front: {
    unify: frontTagMapper.unify.bind(frontTagMapper),
    desunify: frontTagMapper.desunify,
  },
  gorgias: {
    unify: gorgiasTagMapper.unify.bind(gorgiasTagMapper),
    desunify: gorgiasTagMapper.desunify,
  },
  jira: {
    unify: jiraTagMapper.unify.bind(jiraTagMapper),
    desunify: jiraTagMapper.desunify,
  },
};

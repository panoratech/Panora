import { FrontAccountMapper } from '../services/front/mappers';
import { ZendeskAccountMapper } from '../services/zendesk/mappers';

const zendeskAccountMapper = new ZendeskAccountMapper();
const frontAccountMapper = new FrontAccountMapper();
export const accountUnificationMapping = {
  zendesk: {
    unify: zendeskAccountMapper.unify.bind(zendeskAccountMapper),
    desunify: zendeskAccountMapper.desunify,
  },
  front: {
    unify: frontAccountMapper.unify.bind(frontAccountMapper),
    desunify: frontAccountMapper.desunify,
  },
};

import { FrontUserMapper } from '../services/front/mappers';
import { ZendeskUserMapper } from '../services/zendesk/mappers';

const zendeskUserMapper = new ZendeskUserMapper();
const frontUserMapper = new FrontUserMapper();

export const userUnificationMapping = {
  zendesk: {
    unify: zendeskUserMapper.unify.bind(zendeskUserMapper),
    desunify: zendeskUserMapper.desunify,
  },
  front: {
    unify: frontUserMapper.unify.bind(frontUserMapper),
    desunify: frontUserMapper.desunify,
  },
};

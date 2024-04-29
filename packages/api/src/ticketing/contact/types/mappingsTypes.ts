import { FrontContactMapper } from '../services/front/mappers';
import { GorgiasContactMapper } from '../services/gorgias/mappers';
import { ZendeskContactMapper } from '../services/zendesk/mappers';

const zendeskContactMapper = new ZendeskContactMapper();
const frontContactMapper = new FrontContactMapper();
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
  gorgias: {
    unify: gorgiasContactMapper.unify.bind(gorgiasContactMapper),
    desunify: gorgiasContactMapper.desunify,
  },
};

import { FrontCommentMapper } from '../services/front/mappers';
import { GorgiasCommentMapper } from '../services/gorgias/mappers';
import { ZendeskCommentMapper } from '../services/zendesk/mappers';

const zendeskCommentMapper = new ZendeskCommentMapper();
const frontCommentMapper = new FrontCommentMapper();
const gorgiasCommentMapper = new GorgiasCommentMapper();

export const commentUnificationMapping = {
  zendesk: {
    unify: zendeskCommentMapper.unify.bind(zendeskCommentMapper),
    desunify: zendeskCommentMapper.desunify,
  },
  front: {
    unify: frontCommentMapper.unify.bind(frontCommentMapper),
    desunify: frontCommentMapper.desunify,
  },
  gorgias: {
    unify: gorgiasCommentMapper.unify.bind(gorgiasCommentMapper),
    desunify: gorgiasCommentMapper.desunify,
  },
};

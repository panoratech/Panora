import { ZendeskCommentMapper } from '../services/zendesk/mappers';

const zendeskCommentMapper = new ZendeskCommentMapper();

export const commentUnificationMapping = {
  zendesk: {
    unify: zendeskCommentMapper.unify,
    desunify: zendeskCommentMapper.desunify,
  },
};

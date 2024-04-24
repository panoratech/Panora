import { FrontAttachmentMapper } from '../services/front/mappers';
import { GithubAttachmentMapper } from '../services/github/mappers';
import { GorgiasAttachmentMapper } from '../services/gorgias/mappers';
import { ZendeskAttachmentMapper } from '../services/zendesk/mappers';

const zendeskAttachmentMapper = new ZendeskAttachmentMapper();
const githubAttachmentMapper = new GithubAttachmentMapper();
const frontAttachmentMapper = new FrontAttachmentMapper();
const gorgiasAttachmentMapper = new GorgiasAttachmentMapper();

export const attachmentUnificationMapping = {
  zendesk: {
    unify: zendeskAttachmentMapper.unify.bind(zendeskAttachmentMapper),
    desunify: zendeskAttachmentMapper.desunify,
  },
  front: {
    unify: frontAttachmentMapper.unify.bind(frontAttachmentMapper),
    desunify: frontAttachmentMapper.desunify,
  },
  github: {
    unify: githubAttachmentMapper.unify.bind(githubAttachmentMapper),
    desunify: githubAttachmentMapper.desunify,
  },
  gorgias: {
    unify: gorgiasAttachmentMapper.unify.bind(gorgiasAttachmentMapper),
    desunify: gorgiasAttachmentMapper.desunify,
  },
};

import { FrontAttachmentMapper } from '../services/front/mappers';
import { GithubAttachmentMapper } from '../services/github/mappers';
import { ZendeskAttachmentMapper } from '../services/zendesk/mappers';

const zendeskAttachmentMapper = new ZendeskAttachmentMapper();
const frontAttachmentMapper = new FrontAttachmentMapper();
const githubAttachmentMapper = new GithubAttachmentMapper();

export const attachmentUnificationMapping = {
  zendesk: {
    unify: zendeskAttachmentMapper.unify,
    desunify: zendeskAttachmentMapper.desunify,
  },
  front: {
    unify: frontAttachmentMapper.unify,
    desunify: frontAttachmentMapper.desunify,
  },
  github: {
    unify: githubAttachmentMapper.unify,
    desunify: githubAttachmentMapper.desunify,
  },
};

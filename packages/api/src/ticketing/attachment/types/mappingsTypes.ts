import { FrontAttachmentMapper } from '../services/front/mappers';
import { GithubAttachmentMapper } from '../services/github/mappers';
import { ZendeskAttachmentMapper } from '../services/zendesk/mappers';

const zendeskAttachmentMapper = new ZendeskAttachmentMapper();
const githubAttachmentMapper = new GithubAttachmentMapper();
const frontAttachmentMapper = new FrontAttachmentMapper();

export const attachmentUnificationMapping = {
  zendesk_tcg: {
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
};

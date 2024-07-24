import { IAccountService } from '@ticketing/account/types';
import {
  UnifiedTicketingAccountInput,
  UnifiedTicketingAccountOutput,
} from '@ticketing/account/types/model.unified';
import { IAttachmentService } from '@ticketing/attachment/types';
import {
  UnifiedTicketingAttachmentInput,
  UnifiedTicketingAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { ICommentService } from '@ticketing/comment/types';
import {
  UnifiedTicketingCommentInput,
  UnifiedTicketingCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { IContactService } from '@ticketing/contact/types';
import {
  UnifiedTicketingContactInput,
  UnifiedTicketingContactOutput,
} from '@ticketing/contact/types/model.unified';
import { ITagService } from '@ticketing/tag/types';
import {
  UnifiedTicketingTagInput,
  UnifiedTicketingTagOutput,
} from '@ticketing/tag/types/model.unified';
import { ITeamService } from '@ticketing/team/types';
import {
  UnifiedTicketingTeamInput,
  UnifiedTicketingTeamOutput,
} from '@ticketing/team/types/model.unified';
import { ITicketService } from '@ticketing/ticket/types';
import {
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { IUserService } from '@ticketing/user/types';
import {
  UnifiedTicketingUserInput,
  UnifiedTicketingUserOutput,
} from '@ticketing/user/types/model.unified';
import { ICollectionService } from '@ticketing/collection/types';
import {
  UnifiedTicketingCollectionInput,
  UnifiedTicketingCollectionOutput,
} from '@ticketing/collection/types/model.unified';

export enum TicketingObject {
  ticket = 'ticket',
  comment = 'comment',
  user = 'user',
  attachment = 'attachment',
  contact = 'contact',
  account = 'account',
  tag = 'tag',
  team = 'team',
  collection = 'collection',
}

export type UnifiedTicketing =
  | UnifiedTicketingTicketInput
  | UnifiedTicketingTicketOutput
  | UnifiedTicketingCommentInput
  | UnifiedTicketingCommentOutput
  | UnifiedTicketingUserInput
  | UnifiedTicketingUserOutput
  | UnifiedTicketingAccountInput
  | UnifiedTicketingAccountOutput
  | UnifiedTicketingContactInput
  | UnifiedTicketingContactOutput
  | UnifiedTicketingTeamInput
  | UnifiedTicketingTeamOutput
  | UnifiedTicketingTagInput
  | UnifiedTicketingTagOutput
  | UnifiedTicketingAttachmentInput
  | UnifiedTicketingAttachmentOutput
  | UnifiedTicketingCollectionInput
  | UnifiedTicketingCollectionOutput;

export type ITicketingService =
  | ITicketService
  | ICommentService
  | IUserService
  | IAttachmentService
  | IContactService
  | IAccountService
  | ITeamService
  | ITagService
  | ICollectionService;

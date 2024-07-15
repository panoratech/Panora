import { IAccountService } from '@ticketing/account/types';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '@ticketing/account/types/model.unified';
import { IAttachmentService } from '@ticketing/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { ICommentService } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { IContactService } from '@ticketing/contact/types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';
import { ITagService } from '@ticketing/tag/types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';
import { ITeamService } from '@ticketing/team/types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';
import { ITicketService } from '@ticketing/ticket/types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { IUserService } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { ICollectionService } from '@ticketing/collection/types';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
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
  | UnifiedTicketInput
  | UnifiedTicketOutput
  | UnifiedCommentInput
  | UnifiedCommentOutput
  | UnifiedUserInput
  | UnifiedUserOutput
  | UnifiedAccountInput
  | UnifiedAccountOutput
  | UnifiedContactInput
  | UnifiedContactOutput
  | UnifiedTeamInput
  | UnifiedTeamOutput
  | UnifiedTagInput
  | UnifiedTagOutput
  | UnifiedAttachmentInput
  | UnifiedAttachmentOutput
  | UnifiedCollectionInput
  | UnifiedCollectionOutput;

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

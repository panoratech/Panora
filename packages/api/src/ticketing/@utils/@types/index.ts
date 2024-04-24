import { contactUnificationMapping as contactTicketingUnificationMapping } from '@ticketing/contact/types/mappingsTypes';
import { IAccountService } from '@ticketing/account/types';
import { accountUnificationMapping } from '@ticketing/account/types/mappingsTypes';
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
import { commentUnificationMapping } from '@ticketing/comment/types/mappingsTypes';
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
import { tagUnificationMapping } from '@ticketing/tag/types/mappingsTypes';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';
import { ITeamService } from '@ticketing/team/types';
import { teamUnificationMapping } from '@ticketing/team/types/mappingsTypes';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';
import { ITicketService } from '@ticketing/ticket/types';
import { ticketUnificationMapping } from '@ticketing/ticket/types/mappingsTypes';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { IUserService } from '@ticketing/user/types';
import { userUnificationMapping } from '@ticketing/user/types/mappingsTypes';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { ICollectionService } from '@ticketing/collection/types';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from '@ticketing/collection/types/model.unified';
import { collectionUnificationMapping } from '@ticketing/collection/types/mappingsTypes';

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

export const unificationMapping = {
  [TicketingObject.ticket]: ticketUnificationMapping,
  [TicketingObject.comment]: commentUnificationMapping,
  [TicketingObject.user]: userUnificationMapping,
  [TicketingObject.account]: accountUnificationMapping,
  [TicketingObject.contact]: contactTicketingUnificationMapping,
  [TicketingObject.team]: teamUnificationMapping,
  [TicketingObject.tag]: tagUnificationMapping,
  [TicketingObject.collection]: collectionUnificationMapping,
};

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

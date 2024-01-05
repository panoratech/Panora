import {
  ZendeskCommentInput,
  ZendeskTicketInput,
  ZendeskUserInput,
  ZendeskTicketOutput,
  ZendeskCommentOutput,
  ZendeskUserOutput,
  ZendeskAttachmentOutput,
  ZendeskAttachmentInput,
  ZendeskAccountInput,
  ZendeskAccountOutput,
  ZendeskContactInput,
  ZendeskContactOutput,
  ZendeskTagInput,
  ZendeskTagOutput,
  ZendeskTeamInput,
  ZendeskTeamOutput,
} from '@ticketing/@utils/@types';
import {
  FrontAccountInput,
  FrontAccountOutput,
} from '@ticketing/account/services/front/types';
import {
  GithubAccountInput,
  GithubAccountOutput,
} from '@ticketing/account/services/github/types';
import {
  FrontAttachmentInput,
  FrontAttachmentOutput,
} from '@ticketing/attachment/services/front/types';
import {
  GithubAttachmentInput,
  GithubAttachmentOutput,
} from '@ticketing/attachment/services/github/types';
import {
  FrontCommentInput,
  FrontCommentOutput,
} from '@ticketing/comment/services/front/types';
import {
  GithubCommentInput,
  GithubCommentOutput,
} from '@ticketing/comment/services/github/types';
import {
  HubspotCommentInput,
  HubspotCommentOutput,
} from '@ticketing/comment/services/hubspot/types';
import {
  FrontContactInput,
  FrontContactOutput,
} from '@ticketing/contact/services/front/types';
import {
  GithubContactInput,
  GithubContactOutput,
} from '@ticketing/contact/services/github/types';
import {
  FrontTagInput,
  FrontTagOutput,
} from '@ticketing/tag/services/front/types';
import {
  GithubTagInput,
  GithubTagOutput,
} from '@ticketing/tag/services/github/types';
import {
  FrontTeamInput,
  FrontTeamOutput,
} from '@ticketing/team/services/front/types';
import {
  GithubTeamInput,
  GithubTeamOutput,
} from '@ticketing/team/services/github/types';
import {
  FrontTicketInput,
  FrontTicketOutput,
} from '@ticketing/ticket/services/front/types';
import {
  GithubTicketInput,
  GithubTicketOutput,
} from '@ticketing/ticket/services/github/types';
import {
  HubspotTicketInput,
  HubspotTicketOutput,
} from '@ticketing/ticket/services/hubspot/types';
import {
  FrontUserInput,
  FrontUserOutput,
} from '@ticketing/user/services/front/types';
import {
  GithubUserInput,
  GithubUserOutput,
} from '@ticketing/user/services/github/types';

/* INPUT */

/* ticket */
export type OriginalTicketInput =
  | ZendeskTicketInput
  | FrontTicketInput
  | GithubTicketInput
  | HubspotTicketInput;

/* comment */
export type OriginalCommentInput =
  | ZendeskCommentInput
  | FrontCommentInput
  | GithubCommentInput
  | HubspotCommentInput;
/* user */
export type OriginalUserInput =
  | ZendeskUserInput
  | GithubUserInput
  | FrontUserInput;
/* account */
export type OriginalAccountInput =
  | ZendeskAccountInput
  | GithubAccountInput
  | FrontAccountInput;
/* contact */
export type OriginalContactInput =
  | ZendeskContactInput
  | GithubContactInput
  | FrontContactInput;

/* tag */
export type OriginalTagInput = ZendeskTagInput | GithubTagInput | FrontTagInput;
/* team */
export type OriginalTeamInput =
  | ZendeskTeamInput
  | GithubTeamInput
  | FrontTeamInput;

/* attachment */
export type OriginalAttachmentInput =
  | ZendeskAttachmentInput
  | FrontAttachmentInput
  | GithubAttachmentInput;

export type TicketingObjectInput =
  | OriginalTicketInput
  | OriginalCommentInput
  | OriginalUserInput
  | OriginalAttachmentInput
  | OriginalTagInput
  | OriginalTeamInput
  | OriginalContactInput
  | OriginalAccountInput;

/* OUTPUT */

/* ticket */
export type OriginalTicketOutput =
  | ZendeskTicketOutput
  | FrontTicketOutput
  | GithubTicketOutput
  | HubspotTicketOutput;
/* comment */
export type OriginalCommentOutput =
  | ZendeskCommentOutput
  | FrontCommentOutput
  | GithubCommentOutput
  | HubspotCommentOutput;
/* user */
export type OriginalUserOutput =
  | ZendeskUserOutput
  | GithubUserOutput
  | FrontUserOutput;

/* account */
export type OriginalAccountOutput =
  | ZendeskAccountOutput
  | GithubAccountOutput
  | FrontAccountOutput;
/* contact */
export type OriginalContactOutput =
  | ZendeskContactOutput
  | GithubContactOutput
  | FrontContactOutput;

/* tag */
export type OriginalTagOutput =
  | ZendeskTagOutput
  | GithubTagOutput
  | FrontTagOutput;
/* team */
export type OriginalTeamOutput =
  | ZendeskTeamOutput
  | GithubTeamOutput
  | FrontTeamOutput;

/* attachment */
export type OriginalAttachmentOutput =
  | ZendeskAttachmentOutput
  | FrontAttachmentOutput
  | GithubAttachmentOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput
  | OriginalUserOutput
  | OriginalAttachmentOutput
  | OriginalTeamOutput
  | OriginalTagOutput
  | OriginalContactOutput
  | OriginalAccountOutput;

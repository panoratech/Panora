import {
  ZendeskCommentInput,
  ZendeskTicketInput,
  ZendeskUserInput,
  ZendeskTicketOutput,
  ZendeskCommentOutput,
  ZendeskUserOutput,
  ZendeskAttachmentOutput,
  ZendeskAttachmentInput,
} from '@ticketing/@utils/@types';
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
export type OriginalAttachmentInput = ZendeskAttachmentInput;

export type TicketingObjectInput =
  | OriginalTicketInput
  | OriginalCommentInput
  | OriginalUserInput
  | OriginalAttachmentInput;

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
export type OriginalAttachmentOutput = ZendeskAttachmentOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput
  | OriginalUserOutput
  | OriginalAttachmentOutput;

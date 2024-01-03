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
export type OriginalUserInput = ZendeskUserInput;

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
export type OriginalUserOutput = ZendeskUserOutput;

/* attachment */
export type OriginalAttachmentOutput = ZendeskAttachmentOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput
  | OriginalUserOutput
  | OriginalAttachmentOutput;

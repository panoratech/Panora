import {
  FrontAccountInput,
  FrontAccountOutput,
} from '@ticketing/account/services/front/types';
import { FrontAttachmentOutput } from '@ticketing/attachment/services/front/types';
import { ZendeskAttachmentOutput } from '@ticketing/attachment/services/zendesk/types';
import {
  FrontCommentInput,
  FrontCommentOutput,
} from '@ticketing/comment/services/front/types';
import {
  FrontContactInput,
  FrontContactOutput,
} from '@ticketing/contact/services/front/types';
import {
  FrontTagInput,
  FrontTagOutput,
} from '@ticketing/tag/services/front/types';
import {
  FrontTeamInput,
  FrontTeamOutput,
} from '@ticketing/team/services/front/types';
import {
  FrontTicketInput,
  FrontTicketOutput,
} from '@ticketing/ticket/services/front/types';
import {
  GithubTicketInput,
  GithubTicketOutput,
} from '@ticketing/ticket/services/github/types';
import {
  FrontUserInput,
  FrontUserOutput,
} from '@ticketing/user/services/front/types';
import {
  GorgiasTicketInput,
  GorgiasTicketOutput,
} from '@ticketing/ticket/services/gorgias/types';
import {
  JiraTicketInput,
  JiraTicketOutput,
} from '@ticketing/ticket/services/jira/types';
import {
  GorgiasCommentInput,
  GorgiasCommentOutput,
} from '@ticketing/comment/services/gorgias/types';
import {
  JiraCommentInput,
  JiraCommentOutput,
} from '@ticketing/comment/services/jira/types';
import {
  GorgiasUserInput,
  GorgiasUserOutput,
} from '@ticketing/user/services/gorgias/types';
import {
  JiraUserInput,
  JiraUserOutput,
} from '@ticketing/user/services/jira/types';
import {
  GorgiasContactInput,
  GorgiasContactOutput,
} from '@ticketing/contact/services/gorgias/types';
import {
  GorgiasTagInput,
  GorgiasTagOutput,
} from '@ticketing/tag/services/gorgias/types';
import {
  GorgiasTeamInput,
  GorgiasTeamOutput,
} from '@ticketing/team/services/gorgias/types';
import { GorgiasAttachmentOutput } from '@ticketing/attachment/services/gorgias/types';
import { JiraAttachmentOutput } from '@ticketing/attachment/services/jira/types';
import {
  JiraTeamInput,
  JiraTeamOutput,
} from '@ticketing/team/services/jira/types';
import {
  JiraTagInput,
  JiraTagOutput,
} from '@ticketing/tag/services/jira/types';
import {
  JiraCollectionOutput,
  JiraCollectionInput,
} from '@ticketing/collection/services/jira/types';
import {
  ZendeskTicketInput,
  ZendeskTicketOutput,
} from '@ticketing/ticket/services/zendesk/types';
import {
  ZendeskCommentInput,
  ZendeskCommentOutput,
} from '@ticketing/comment/services/zendesk/types';
import {
  ZendeskAccountInput,
  ZendeskAccountOutput,
} from '@ticketing/account/services/zendesk/types';
import {
  ZendeskTeamInput,
  ZendeskTeamOutput,
} from '@ticketing/team/services/zendesk/types';
import {
  ZendeskTagInput,
  ZendeskTagOutput,
} from '@ticketing/tag/services/zendesk/types';
import {
  ZendeskContactInput,
  ZendeskContactOutput,
} from '@ticketing/contact/services/zendesk/types';
import {
  ZendeskUserInput,
  ZendeskUserOutput,
} from '@ticketing/user/services/zendesk/types';
import {
  GitlabCollectionInput,
  GitlabCollectionOutput,
} from '@ticketing/collection/services/gitlab/types';
import {
  GitlabTicketInput,
  GitlabTicketOutput,
} from '@ticketing/ticket/services/gitlab/types';
import {
  GitlabCommentInput,
  GitlabCommentOutput,
} from '@ticketing/comment/services/gitlab/types';
import {
  GitlabTagInput,
  GitlabTagOutput,
} from '@ticketing/tag/services/gitlab/types';

/* INPUT */

/* ticket */
export type OriginalTicketInput =
  | ZendeskTicketInput
  | FrontTicketInput
  | GithubTicketInput
  | GorgiasTicketInput
  | JiraTicketInput
  | GitlabTicketInput;
//| JiraServiceMgmtTicketInput;

/* comment */
export type OriginalCommentInput =
  | ZendeskCommentInput
  | FrontCommentInput
  | GorgiasCommentInput
  | JiraCommentInput
  | GitlabCommentInput;
//| JiraCommentServiceMgmtInput;
/* user */
export type OriginalUserInput =
  | ZendeskUserInput
  | FrontUserInput
  | GorgiasUserInput
  | JiraUserInput;
//| JiraServiceMgmtUserInput;
/* account */
export type OriginalAccountInput = ZendeskAccountInput | FrontAccountInput;
/* contact */
export type OriginalContactInput =
  | ZendeskContactInput
  | FrontContactInput
  | GorgiasContactInput;

/* tag */
export type OriginalTagInput =
  | ZendeskTagInput
  | FrontTagInput
  | GorgiasTagInput
  | JiraTagInput
  | GitlabTagInput;

/* team */
export type OriginalTeamInput =
  | ZendeskTeamInput
  | FrontTeamInput
  | GorgiasTeamInput
  | JiraTeamInput;

/* attachment */
export type OriginalAttachmentInput = null;
export type OriginalCollectionInput =
  | JiraCollectionInput
  | GitlabCollectionInput;

export type TicketingObjectInput =
  | OriginalTicketInput
  | OriginalCommentInput
  | OriginalUserInput
  | OriginalAttachmentInput
  | OriginalTagInput
  | OriginalTeamInput
  | OriginalContactInput
  | OriginalAccountInput
  | OriginalCollectionInput;

/* OUTPUT */

/* ticket */
export type OriginalTicketOutput =
  | ZendeskTicketOutput
  | FrontTicketOutput
  | GithubTicketOutput
  | GorgiasTicketOutput
  | JiraTicketOutput
  | GitlabTicketOutput;

/* comment */
export type OriginalCommentOutput =
  | ZendeskCommentOutput
  | FrontCommentOutput
  | GorgiasCommentOutput
  | JiraCommentOutput
  | GitlabCommentOutput;
/* user */
export type OriginalUserOutput =
  | ZendeskUserOutput
  | FrontUserOutput
  | GorgiasUserOutput
  | JiraUserOutput;
/* account */
export type OriginalAccountOutput = ZendeskAccountOutput | FrontAccountOutput;
/* contact */
export type OriginalContactOutput =
  | ZendeskContactOutput
  | FrontContactOutput
  | GorgiasContactOutput;

/* tag */
export type OriginalTagOutput =
  | ZendeskTagOutput
  | FrontTagOutput
  | GorgiasTagOutput
  | JiraTagOutput
  | GitlabTagOutput;

/* team */
export type OriginalTeamOutput =
  | ZendeskTeamOutput
  | FrontTeamOutput
  | GorgiasTeamOutput
  | JiraTeamOutput;

/* attachment */
export type OriginalAttachmentOutput =
  | ZendeskAttachmentOutput
  | FrontAttachmentOutput
  | GorgiasAttachmentOutput
  | JiraAttachmentOutput;

/* collection */

export type OriginalCollectionOutput =
  | JiraCollectionOutput
  | GitlabCollectionOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput
  | OriginalUserOutput
  | OriginalAttachmentOutput
  | OriginalTeamOutput
  | OriginalTagOutput
  | OriginalContactOutput
  | OriginalAccountOutput
  | OriginalCollectionOutput;

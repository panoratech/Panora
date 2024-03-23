import {
  ZendeskCommentInput,
  ZendeskTicketInput,
  ZendeskUserInput,
  ZendeskTicketOutput,
  ZendeskCommentOutput,
  ZendeskUserOutput,
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
import { FrontAttachmentOutput } from '@ticketing/attachment/services/front/types';
import { GithubAttachmentOutput } from '@ticketing/attachment/services/github/types';
import { ZendeskAttachmentOutput } from '@ticketing/attachment/services/zendesk/types';

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
} from '@ticketing/team/services/JIRA/types';
import {
  JiraTagInput,
  JiraTagOutput,
} from '@ticketing/tag/services/jira/types';

/* INPUT */

/* ticket */
export type OriginalTicketInput =
  | ZendeskTicketInput
  | FrontTicketInput
  | GithubTicketInput
  | HubspotTicketInput
  | GorgiasTicketInput
  | JiraTicketInput;
//| JiraServiceMgmtTicketInput;

/* comment */
export type OriginalCommentInput =
  | ZendeskCommentInput
  | FrontCommentInput
  | GithubCommentInput
  | HubspotCommentInput
  | GorgiasCommentInput
  | JiraCommentInput;
//| JiraCommentServiceMgmtInput;
/* user */
export type OriginalUserInput =
  | ZendeskUserInput
  | GithubUserInput
  | FrontUserInput
  | GorgiasUserInput
  | JiraUserInput;
//| JiraServiceMgmtUserInput;
/* account */
export type OriginalAccountInput =
  | ZendeskAccountInput
  | GithubAccountInput
  | FrontAccountInput;
/* contact */
export type OriginalContactInput =
  | ZendeskContactInput
  | GithubContactInput
  | FrontContactInput
  | GorgiasContactInput;

/* tag */
export type OriginalTagInput =
  | ZendeskTagInput
  | GithubTagInput
  | FrontTagInput
  | GorgiasTagInput
  | JiraTagInput;
/* team */
export type OriginalTeamInput =
  | ZendeskTeamInput
  | GithubTeamInput
  | FrontTeamInput
  | GorgiasTeamInput
  | JiraTeamInput;

/* attachment */
export type OriginalAttachmentInput = null;

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
  | HubspotTicketOutput
  | GorgiasTicketOutput
  | JiraTicketOutput;

/* comment */
export type OriginalCommentOutput =
  | ZendeskCommentOutput
  | FrontCommentOutput
  | GithubCommentOutput
  | HubspotCommentOutput
  | GorgiasCommentOutput
  | JiraCommentOutput;
/* user */
export type OriginalUserOutput =
  | ZendeskUserOutput
  | GithubUserOutput
  | FrontUserOutput
  | GorgiasUserOutput
  | JiraUserOutput;
/* account */
export type OriginalAccountOutput =
  | ZendeskAccountOutput
  | GithubAccountOutput
  | FrontAccountOutput;
/* contact */
export type OriginalContactOutput =
  | ZendeskContactOutput
  | GithubContactOutput
  | FrontContactOutput
  | GorgiasContactOutput;

/* tag */
export type OriginalTagOutput =
  | ZendeskTagOutput
  | GithubTagOutput
  | FrontTagOutput
  | GorgiasTagOutput
  | JiraTagOutput;

/* team */
export type OriginalTeamOutput =
  | ZendeskTeamOutput
  | GithubTeamOutput
  | FrontTeamOutput
  | GorgiasTeamOutput
  | JiraTeamOutput;

/* attachment */
export type OriginalAttachmentOutput =
  | ZendeskAttachmentOutput
  | FrontAttachmentOutput
  | GithubAttachmentOutput
  | GorgiasAttachmentOutput
  | JiraAttachmentOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput
  | OriginalUserOutput
  | OriginalAttachmentOutput
  | OriginalTeamOutput
  | OriginalTagOutput
  | OriginalContactOutput
  | OriginalAccountOutput;

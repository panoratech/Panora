import { LinearTicketInput, LinearTicketOutput } from '@ticketing/ticket/services/linear/types';

import { LinearCommentInput, LinearCommentOutput } from '@ticketing/comment/services/linear/types';

import { LinearCollectionInput, LinearCollectionOutput } from '@ticketing/collection/services/linear/types';

import { LinearTagInput, LinearTagOutput } from '@ticketing/tag/services/linear/types';

import { LinearTeamInput, LinearTeamOutput } from '@ticketing/team/services/linear/types';

import { LinearUserInput, LinearUserOutput } from '@ticketing/user/services/linear/types';

import { GithubCollectionInput, GithubCollectionOutput } from '@ticketing/collection/services/github/types';

import { GithubCommentInput, GithubCommentOutput } from '@ticketing/comment/services/github/types';

import { GithubTagInput, GithubTagOutput } from '@ticketing/tag/services/github/types';

import { GithubTeamInput, GithubTeamOutput } from '@ticketing/team/services/github/types';

import { GithubTicketInput, GithubTicketOutput } from '@ticketing/ticket/services/github/types';

import { GithubUserInput, GithubUserOutput } from '@ticketing/user/services/github/types';

import { GitlabUserInput, GitlabUserOutput } from '@ticketing/user/services/gitlab/types';

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
  | GorgiasTicketInput
  | JiraTicketInput
  | GitlabTicketInput | GithubTicketInput | LinearTicketInput;
//| JiraServiceMgmtTicketInput;

/* comment */
export type OriginalCommentInput =
  | ZendeskCommentInput
  | FrontCommentInput
  | GorgiasCommentInput
  | JiraCommentInput
  | GitlabCommentInput | GithubCommentInput | LinearCommentInput;
//| JiraCommentServiceMgmtInput;
/* user */
export type OriginalUserInput =
  | ZendeskUserInput
  | FrontUserInput
  | GorgiasUserInput
  | JiraUserInput | GithubUserInput | GitlabUserInput | LinearUserInput;
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
  | GitlabTagInput | GithubTagInput | LinearTagInput;

/* team */
export type OriginalTeamInput =
  | ZendeskTeamInput
  | FrontTeamInput
  | GorgiasTeamInput
  | JiraTeamInput | GithubTeamInput | LinearTeamInput;

/* attachment */
export type OriginalAttachmentInput = null;
export type OriginalCollectionInput =
  | JiraCollectionInput
  | GitlabCollectionInput | GithubCollectionInput | LinearCollectionInput;

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
  | GorgiasTicketOutput
  | JiraTicketOutput
  | GitlabTicketOutput | GithubTicketOutput | LinearTicketOutput;

/* comment */
export type OriginalCommentOutput =
  | ZendeskCommentOutput
  | FrontCommentOutput
  | GorgiasCommentOutput
  | JiraCommentOutput
  | GitlabCommentOutput | GithubCommentOutput | LinearCommentOutput;
/* user */
export type OriginalUserOutput =
  | ZendeskUserOutput
  | FrontUserOutput
  | GorgiasUserOutput
  | JiraUserOutput | GithubUserOutput | GitlabUserOutput | LinearUserOutput;
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
  | GitlabTagOutput | GithubTagOutput | LinearTagOutput;

/* team */
export type OriginalTeamOutput =
  | ZendeskTeamOutput
  | FrontTeamOutput
  | GorgiasTeamOutput
  | JiraTeamOutput | GithubTeamOutput | LinearTeamOutput;

/* attachment */
export type OriginalAttachmentOutput =
  | ZendeskAttachmentOutput
  | FrontAttachmentOutput
  | GorgiasAttachmentOutput
  | JiraAttachmentOutput;

/* collection */

export type OriginalCollectionOutput =
  | JiraCollectionOutput
  | GitlabCollectionOutput | GithubCollectionOutput | LinearCollectionOutput;

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

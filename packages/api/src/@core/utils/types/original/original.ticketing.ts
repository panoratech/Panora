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
  FrontTicketInput,
  FrontTicketOutput,
} from '@ticketing/ticket/services/front/types';

/* INPUT */

/* ticket */
export type OriginalTicketInput = ZendeskTicketInput | FrontTicketInput;

/* comment */
export type OriginalCommentInput = ZendeskCommentInput;

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
export type OriginalTicketOutput = ZendeskTicketOutput | FrontTicketOutput;

/* comment */
export type OriginalCommentOutput = ZendeskCommentOutput;

/* user */
export type OriginalUserOutput = ZendeskUserOutput;

/* attachment */
export type OriginalAttachmentOutput = ZendeskAttachmentOutput;

export type TicketingObjectOutput =
  | OriginalTicketOutput
  | OriginalCommentOutput
  | OriginalUserOutput
  | OriginalAttachmentOutput;

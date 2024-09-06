/* INPUT */

import {
  AshbyActivityInput,
  AshbyActivityOutput,
} from '@ats/activity/services/ashby/types';
import {
  AshbyApplicationInput,
  AshbyApplicationOutput,
} from '@ats/application/services/ashby/types';
import {
  AshbyAttachmentInput,
  AshbyAttachmentOutput,
} from '@ats/attachment/services/ashby/types';
import {
  AshbyCandidateInput,
  AshbyCandidateOutput,
} from '@ats/candidate/services/ashby/types';
import {
  AshbyDepartmentInput,
  AshbyDepartmentOutput,
} from '@ats/department/services/ashby/types';
import {
  AshbyInterviewInput,
  AshbyInterviewOutput,
} from '@ats/interview/services/ashby/types';
import { AshbyJobInput, AshbyJobOutput } from '@ats/job/services/ashby/types';
import {
  AshbyJobInterviewStageInput,
  AshbyJobInterviewStageOutput,
} from '@ats/jobinterviewstage/services/ashby/types';
import {
  AshbyOfferInput,
  AshbyOfferOutput,
} from '@ats/offer/services/ashby/types';
import {
  AshbyOfficeInput,
  AshbyOfficeOutput,
} from '@ats/office/services/ashby/types';
import {
  AshbyRejectReasonInput,
  AshbyRejectReasonOutput,
} from '@ats/rejectreason/services/ashby/types';
import { AshbyTagInput, AshbyTagOutput } from '@ats/tag/services/ashby/types';
import {
  AshbyUserInput,
  AshbyUserOutput,
} from '@ats/user/services/ashby/types';

/* activity */
export type OriginalActivityInput = AshbyActivityInput;

/* application */
export type OriginalApplicationInput = AshbyApplicationInput;

/* attachment */
export type OriginalAttachmentInput = AshbyAttachmentInput;

/* candidate */
export type OriginalCandidateInput = AshbyCandidateInput;

/* department */
export type OriginalDepartmentInput = AshbyDepartmentInput;

/* interview */
export type OriginalInterviewInput = AshbyInterviewInput;

/* jobinterviewstage */
export type OriginalJobInterviewStageInput = AshbyJobInterviewStageInput;

/* job */
export type OriginalJobInput = AshbyJobInput;

/* offer */
export type OriginalOfferInput = AshbyOfferInput;

/* office */
export type OriginalOfficeInput = AshbyOfficeInput;

/* rejectreason */
export type OriginalRejectReasonInput = AshbyRejectReasonInput;

/* scorecard */
export type OriginalScoreCardInput = any;

/* tag */
export type OriginalTagInput = AshbyTagInput;

/* user */
export type OriginalUserInput = AshbyUserInput;

/* eeocs */
export type OriginalEeocsInput = any;

export type AtsObjectInput =
  | OriginalActivityInput
  | OriginalApplicationInput
  | OriginalAttachmentInput
  | OriginalCandidateInput
  | OriginalDepartmentInput
  | OriginalInterviewInput
  | OriginalJobInterviewStageInput
  | OriginalJobInput
  | OriginalOfferInput
  | OriginalOfficeInput
  | OriginalRejectReasonInput
  | OriginalScoreCardInput
  | OriginalTagInput
  | OriginalUserInput
  | OriginalEeocsInput;

/* OUTPUT */

/* activity */
export type OriginalActivityOutput = AshbyActivityOutput;

/* application */
export type OriginalApplicationOutput = AshbyApplicationOutput;

/* attachment */
export type OriginalAttachmentOutput = AshbyAttachmentOutput;

/* candidate */
export type OriginalCandidateOutput = AshbyCandidateOutput;

/* department */
export type OriginalDepartmentOutput = AshbyDepartmentOutput;

/* interview */
export type OriginalInterviewOutput = AshbyInterviewOutput;

/* jobinterviewstage */
export type OriginalJobInterviewStageOutput = AshbyJobInterviewStageOutput;

/* job */
export type OriginalJobOutput = AshbyJobOutput;

/* offer */
export type OriginalOfferOutput = AshbyOfferOutput;

/* office */
export type OriginalOfficeOutput = AshbyOfficeOutput;

/* rejectreason */
export type OriginalRejectReasonOutput = AshbyRejectReasonOutput;

/* scorecard */
export type OriginalScoreCardOutput = any;

/* tag */
export type OriginalTagOutput = AshbyTagOutput;

/* user */
export type OriginalUserOutput = AshbyUserOutput;

/* eeocs */
export type OriginalEeocsOutput = any;

export type AtsObjectOutput =
  | OriginalActivityOutput
  | OriginalApplicationOutput
  | OriginalAttachmentOutput
  | OriginalCandidateOutput
  | OriginalDepartmentOutput
  | OriginalInterviewOutput
  | OriginalJobInterviewStageOutput
  | OriginalJobOutput
  | OriginalOfferOutput
  | OriginalOfficeOutput
  | OriginalRejectReasonOutput
  | OriginalScoreCardOutput
  | OriginalTagOutput
  | OriginalUserOutput
  | OriginalEeocsOutput;

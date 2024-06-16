import { IActivityService } from '@ats/activity/types';
import { activityUnificationMapping } from '@ats/activity/types/mappingsTypes';
import {
  UnifiedActivityInput,
  UnifiedActivityOutput,
} from '@ats/activity/types/model.unified';
import { IApplicationService } from '@ats/application/types';
import { applicationUnificationMapping } from '@ats/application/types/mappingsTypes';
import {
  UnifiedApplicationInput,
  UnifiedApplicationOutput,
} from '@ats/application/types/model.unified';
import { IAttachmentService } from '@ats/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ats/attachment/types/model.unified';
import { ICandidateService } from '@ats/candidate/types';
import { candidateUnificationMapping } from '@ats/candidate/types/mappingsTypes';
import {
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from '@ats/candidate/types/model.unified';
import { IDepartmentService } from '@ats/department/types';
import { departmentUnificationMapping } from '@ats/department/types/mappingsTypes';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from '@ats/department/types/model.unified';
import { IEeocsService } from '@ats/eeocs/types';
import { eeocsUnificationMapping } from '@ats/eeocs/types/mappingsTypes';
import {
  UnifiedEeocsInput,
  UnifiedEeocsOutput,
} from '@ats/eeocs/types/model.unified';
import { IInterviewService } from '@ats/interview/types';
import { interviewUnificationMapping } from '@ats/interview/types/mappingsTypes';
import {
  UnifiedInterviewInput,
  UnifiedInterviewOutput,
} from '@ats/interview/types/model.unified';
import { IJobService } from '@ats/job/types';
import { jobUnificationMapping } from '@ats/job/types/mappingsTypes';
import {
  UnifiedJobInput,
  UnifiedJobOutput,
} from '@ats/job/types/model.unified';
import { IOfferService } from '@ats/offer/types';
import { offerUnificationMapping } from '@ats/offer/types/mappingsTypes';
import {
  UnifiedOfferInput,
  UnifiedOfferOutput,
} from '@ats/offer/types/model.unified';
import { IOfficeService } from '@ats/office/types';
import { officeUnificationMapping } from '@ats/office/types/mappingsTypes';
import {
  UnifiedOfficeInput,
  UnifiedOfficeOutput,
} from '@ats/office/types/model.unified';
import { scorecardUnificationMapping } from '@ats/scorecard/types/mappingsTypes';
import { attachmentUnificationMapping } from '@ats/attachment/types/mappingsTypes';
import { ITagService } from '@ats/tag/types';
import { tagUnificationMapping } from '@ats/tag/types/mappingsTypes';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ats/tag/types/model.unified';
import { IUserService } from '@ats/user/types';
import { userUnificationMapping } from '@ats/user/types/mappingsTypes';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ats/user/types/model.unified';
import { jobinterviewstageUnificationMapping } from '@ats/jobinterviewstage/types/mappingsTypes';
import { rejectreasonUnificationMapping } from '@ats/rejectreason/types/mappingsTypes';
import { screeningquestionUnificationMapping } from '@ats/screeningquestion/types/mappingsTypes';
import { IJobInterviewStageService } from '@ats/jobinterviewstage/types';
import {
  UnifiedJobInterviewStageInput,
  UnifiedJobInterviewStageOutput,
} from '@ats/jobinterviewstage/types/model.unified';
import { IRejectReasonService } from '@ats/rejectreason/types';
import {
  UnifiedRejectReasonInput,
  UnifiedRejectReasonOutput,
} from '@ats/rejectreason/types/model.unified';
import { IScoreCardService } from '@ats/scorecard/types';
import {
  UnifiedScoreCardInput,
  UnifiedScoreCardOutput,
} from '@ats/scorecard/types/model.unified';
import { IScreeningQuestionService } from '@ats/screeningquestion/types';
import {
  UnifiedScreeningQuestionInput,
  UnifiedScreeningQuestionOutput,
} from '@ats/screeningquestion/types/model.unified';

export enum AtsObject {
  activity = 'activity',
  application = 'application',
  attachment = 'attachment',
  candidate = 'candidate',
  department = 'department',
  interview = 'interview',
  jobinterviewstage = 'jobinterviewstage',
  job = 'job',
  offer = 'offer',
  office = 'office',
  rejectreason = 'rejectreason',
  scorecard = 'scorecard',
  screeningquestion = 'screeningquestion',
  tag = 'tag',
  user = 'user',
  eeocs = 'eeocs',
}

export type UnifiedAts =
  | UnifiedActivityInput
  | UnifiedActivityOutput
  | UnifiedApplicationInput
  | UnifiedApplicationOutput
  | UnifiedAttachmentInput
  | UnifiedAttachmentOutput
  | UnifiedCandidateInput
  | UnifiedCandidateOutput
  | UnifiedDepartmentInput
  | UnifiedDepartmentOutput
  | UnifiedInterviewInput
  | UnifiedInterviewOutput
  | UnifiedJobInterviewStageInput
  | UnifiedJobInterviewStageOutput
  | UnifiedJobInput
  | UnifiedJobOutput
  | UnifiedOfferInput
  | UnifiedOfferOutput
  | UnifiedOfficeInput
  | UnifiedOfficeOutput
  | UnifiedRejectReasonInput
  | UnifiedRejectReasonOutput
  | UnifiedScoreCardInput
  | UnifiedScoreCardOutput
  | UnifiedScreeningQuestionInput
  | UnifiedScreeningQuestionOutput
  | UnifiedTagInput
  | UnifiedTagOutput
  | UnifiedUserInput
  | UnifiedUserOutput
  | UnifiedEeocsInput
  | UnifiedEeocsOutput;

export const unificationMapping = {
  [AtsObject.activity]: activityUnificationMapping,
  [AtsObject.application]: applicationUnificationMapping,
  [AtsObject.attachment]: attachmentUnificationMapping,
  [AtsObject.candidate]: candidateUnificationMapping,
  [AtsObject.department]: departmentUnificationMapping,
  [AtsObject.interview]: interviewUnificationMapping,
  [AtsObject.jobinterviewstage]: jobinterviewstageUnificationMapping,
  [AtsObject.job]: jobUnificationMapping,
  [AtsObject.offer]: offerUnificationMapping,
  [AtsObject.office]: officeUnificationMapping,
  [AtsObject.rejectreason]: rejectreasonUnificationMapping,
  [AtsObject.scorecard]: scorecardUnificationMapping,
  [AtsObject.screeningquestion]: screeningquestionUnificationMapping,
  [AtsObject.tag]: tagUnificationMapping,
  [AtsObject.user]: userUnificationMapping,
  [AtsObject.eeocs]: eeocsUnificationMapping,
};

export type IAtsService =
  | IActivityService
  | IApplicationService
  | IAttachmentService
  | ICandidateService
  | IDepartmentService
  | IInterviewService
  | IJobInterviewStageService
  | IJobService
  | IOfferService
  | IOfficeService
  | IRejectReasonService
  | IScoreCardService
  | IScreeningQuestionService
  | ITagService
  | IUserService
  | IEeocsService;

import { IActivityService } from '@ats/activity/types';
import {
  UnifiedActivityInput,
  UnifiedActivityOutput,
} from '@ats/activity/types/model.unified';
import { IApplicationService } from '@ats/application/types';
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
import {
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from '@ats/candidate/types/model.unified';
import { IDepartmentService } from '@ats/department/types';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from '@ats/department/types/model.unified';
import { IEeocsService } from '@ats/eeocs/types';
import {
  UnifiedEeocsInput,
  UnifiedEeocsOutput,
} from '@ats/eeocs/types/model.unified';
import { IInterviewService } from '@ats/interview/types';
import {
  UnifiedInterviewInput,
  UnifiedInterviewOutput,
} from '@ats/interview/types/model.unified';
import { IJobService } from '@ats/job/types';
import {
  UnifiedJobInput,
  UnifiedJobOutput,
} from '@ats/job/types/model.unified';
import { IJobInterviewStageService } from '@ats/jobinterviewstage/types';
import {
  UnifiedJobInterviewStageInput,
  UnifiedJobInterviewStageOutput,
} from '@ats/jobinterviewstage/types/model.unified';
import { IOfferService } from '@ats/offer/types';
import {
  UnifiedOfferInput,
  UnifiedOfferOutput,
} from '@ats/offer/types/model.unified';
import { IOfficeService } from '@ats/office/types';
import {
  UnifiedOfficeInput,
  UnifiedOfficeOutput,
} from '@ats/office/types/model.unified';
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
import { ITagService } from '@ats/tag/types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ats/tag/types/model.unified';
import { IUserService } from '@ats/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ats/user/types/model.unified';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

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
  | UnifiedTagInput
  | UnifiedTagOutput
  | UnifiedUserInput
  | UnifiedUserOutput
  | UnifiedEeocsInput
  | UnifiedEeocsOutput;

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
  | ITagService
  | IUserService
  | IEeocsService;

export class Email {
  @ApiProperty({
    type: String,
    description: 'The email address',
  })
  @IsString()
  email_address: string;

  @ApiProperty({
    type: String,
    description:
      'The email address type. Authorized values are either PERSONAL or WORK.',
  })
  @IsIn(['PERSONAL', 'WORK'])
  @IsString()
  email_address_type: string;
}

export class Phone {
  @ApiProperty({
    type: String,
    description:
      'The phone number starting with a plus (+) followed by the country code (e.g +336676778890 for France)',
  })
  @IsString()
  phone_number: string;

  @ApiProperty({
    type: String,
    description: 'The phone type. Authorized values are either MOBILE or WORK',
  })
  @IsIn(['MOBILE', 'WORK'])
  @IsString()
  phone_type: string;
}

export class Url {
  url: string;
  url_type: 'WEBSITE' | 'BLOG' | 'LINKEDIN' | 'GITHUB' | 'OTHER' | string;
}

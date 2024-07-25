import { IActivityService } from '@ats/activity/types';
import {
  UnifiedAtsActivityInput,
  UnifiedAtsActivityOutput,
} from '@ats/activity/types/model.unified';
import { IApplicationService } from '@ats/application/types';
import {
  UnifiedAtsApplicationInput,
  UnifiedAtsApplicationOutput,
} from '@ats/application/types/model.unified';
import { IAttachmentService } from '@ats/attachment/types';
import {
  UnifiedAtsAttachmentInput,
  UnifiedAtsAttachmentOutput,
} from '@ats/attachment/types/model.unified';
import { ICandidateService } from '@ats/candidate/types';
import {
  UnifiedAtsCandidateInput,
  UnifiedAtsCandidateOutput,
} from '@ats/candidate/types/model.unified';
import { IDepartmentService } from '@ats/department/types';
import {
  UnifiedAtsDepartmentInput,
  UnifiedAtsDepartmentOutput,
} from '@ats/department/types/model.unified';
import { IEeocsService } from '@ats/eeocs/types';
import {
  UnifiedAtsEeocsInput,
  UnifiedAtsEeocsOutput,
} from '@ats/eeocs/types/model.unified';
import { IInterviewService } from '@ats/interview/types';
import {
  UnifiedAtsInterviewInput,
  UnifiedAtsInterviewOutput,
} from '@ats/interview/types/model.unified';
import { IJobService } from '@ats/job/types';
import {
  UnifiedAtsJobInput,
  UnifiedAtsJobOutput,
} from '@ats/job/types/model.unified';
import { IJobInterviewStageService } from '@ats/jobinterviewstage/types';
import {
  UnifiedAtsJobinterviewstageInput,
  UnifiedAtsJobinterviewstageOutput,
} from '@ats/jobinterviewstage/types/model.unified';
import { IOfferService } from '@ats/offer/types';
import {
  UnifiedAtsOfferInput,
  UnifiedAtsOfferOutput,
} from '@ats/offer/types/model.unified';
import { IOfficeService } from '@ats/office/types';
import {
  UnifiedAtsOfficeInput,
  UnifiedAtsOfficeOutput,
} from '@ats/office/types/model.unified';
import { IRejectReasonService } from '@ats/rejectreason/types';
import {
  UnifiedAtsRejectreasonInput,
  UnifiedAtsRejectreasonOutput,
} from '@ats/rejectreason/types/model.unified';
import { IScoreCardService } from '@ats/scorecard/types';
import {
  UnifiedAtsScorecardInput,
  UnifiedAtsScorecardOutput,
} from '@ats/scorecard/types/model.unified';
import { ITagService } from '@ats/tag/types';
import {
  UnifiedAtsTagInput,
  UnifiedAtsTagOutput,
} from '@ats/tag/types/model.unified';
import { IUserService } from '@ats/user/types';
import {
  UnifiedAtsUserInput,
  UnifiedAtsUserOutput,
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
  | UnifiedAtsActivityInput
  | UnifiedAtsActivityOutput
  | UnifiedAtsApplicationInput
  | UnifiedAtsApplicationOutput
  | UnifiedAtsAttachmentInput
  | UnifiedAtsAttachmentOutput
  | UnifiedAtsCandidateInput
  | UnifiedAtsCandidateOutput
  | UnifiedAtsDepartmentInput
  | UnifiedAtsDepartmentOutput
  | UnifiedAtsInterviewInput
  | UnifiedAtsInterviewOutput
  | UnifiedAtsJobinterviewstageInput
  | UnifiedAtsJobinterviewstageOutput
  | UnifiedAtsJobInput
  | UnifiedAtsJobOutput
  | UnifiedAtsOfferInput
  | UnifiedAtsOfferOutput
  | UnifiedAtsOfficeInput
  | UnifiedAtsOfficeOutput
  | UnifiedAtsRejectreasonInput
  | UnifiedAtsRejectreasonOutput
  | UnifiedAtsScorecardInput
  | UnifiedAtsScorecardOutput
  | UnifiedAtsTagInput
  | UnifiedAtsTagOutput
  | UnifiedAtsUserInput
  | UnifiedAtsUserOutput
  | UnifiedAtsEeocsInput
  | UnifiedAtsEeocsOutput;

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

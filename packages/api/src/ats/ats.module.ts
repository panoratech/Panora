import { Module } from '@nestjs/common';
import { ActivityModule } from './activity/activity.module';
import { ApplicationModule } from './application/application.module';
import { AttachmentModule } from './attachment/attachment.module';
import { CandidateModule } from './candidate/candidate.module';
import { DepartmentModule } from './department/department.module';
import { InterviewModule } from './interview/interview.module';
import { JobInterviewStageModule } from './jobinterviewstage/jobinterviewstage.module';
import { JobModule } from './job/job.module';
import { OfferModule } from './offer/offer.module';
import { OfficeModule } from './office/office.module';
import { RejectReasonModule } from './rejectreason/rejectreason.module';
import { ScoreCardModule } from './scorecard/scorecard.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { EeocsModule } from './eeocs/eeocs.module';
import { AtsUnificationService } from './@lib/@unification';

@Module({
  exports: [
    ActivityModule,
    ApplicationModule,
    AttachmentModule,
    CandidateModule,
    DepartmentModule,
    InterviewModule,
    JobInterviewStageModule,
    JobModule,
    OfferModule,
    OfficeModule,
    RejectReasonModule,
    ScoreCardModule,
    TagModule,
    UserModule,
    EeocsModule,
  ],
  providers: [AtsUnificationService],
  imports: [
    ActivityModule,
    ApplicationModule,
    AttachmentModule,
    CandidateModule,
    DepartmentModule,
    InterviewModule,
    JobInterviewStageModule,
    JobModule,
    OfferModule,
    OfficeModule,
    RejectReasonModule,
    ScoreCardModule,
    TagModule,
    UserModule,
    EeocsModule,
  ],
})
export class AtsModule {}

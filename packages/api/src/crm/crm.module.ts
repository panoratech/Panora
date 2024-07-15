import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { DealModule } from './deal/deal.module';
import { NoteModule } from './note/note.module';
import { EngagementModule } from './engagement/engagement.module';
import { StageModule } from './stage/stage.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { CrmWebhookHandlerModule } from './@webhook/handler.module';
import { CrmUnificationService } from './@lib/@unification';
@Module({
  imports: [
    ContactModule,
    DealModule,
    NoteModule,
    CompanyModule,
    EngagementModule,
    StageModule,
    TaskModule,
    UserModule,
    CrmWebhookHandlerModule,
  ],
  providers: [CrmUnificationService],
  exports: [
    ContactModule,
    DealModule,
    NoteModule,
    CompanyModule,
    EngagementModule,
    StageModule,
    TaskModule,
    UserModule,
    CrmWebhookHandlerModule,
  ],
})
export class CrmModule {}

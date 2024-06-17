import { Module } from '@nestjs/common';
import { ActionModule } from './action/action.module';
import { AutomationModule } from './automation/automation.module';
import { CampaignModule } from './campaign/campaign.module';
import { ContactModule } from './contact/contact.module';
import { EmailModule } from './email/email.module';
import { EventModule } from './event/event.module';
import { ListModule } from './list/list.module';
import { MessageModule } from './message/message.module';
import { TemplateModule } from './template/template.module';
import { UserModule } from './user/user.module';

@Module({
  exports: [
    ActionModule,
    AutomationModule,
    CampaignModule,
    ContactModule,
    EmailModule,
    EventModule,
    ListModule,
    MessageModule,
    TemplateModule,
    UserModule,
  ],
  imports: [
    ActionModule,
    AutomationModule,
    CampaignModule,
    ContactModule,
    EmailModule,
    EventModule,
    ListModule,
    MessageModule,
    TemplateModule,
    UserModule,
  ],
})
export class MarketingAutomationModule {}

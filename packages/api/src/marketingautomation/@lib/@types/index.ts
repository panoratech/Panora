import { IActionService } from '@marketingautomation/action/types';
import {
  UnifiedActionInput,
  UnifiedActionOutput,
} from '@marketingautomation/action/types/model.unified';
import { IAutomationService } from '@marketingautomation/automation/types';
import {
  UnifiedAutomationInput,
  UnifiedAutomationOutput,
} from '@marketingautomation/automation/types/model.unified';
import { ICampaignService } from '@marketingautomation/campaign/types';
import {
  UnifiedCampaignInput,
  UnifiedCampaignOutput,
} from '@marketingautomation/campaign/types/model.unified';
import { IEmailService } from '@marketingautomation/email/types';
import {
  UnifiedEmailInput,
  UnifiedEmailOutput,
} from '@marketingautomation/email/types/model.unified';
import { IEventService } from '@marketingautomation/event/types';
import {
  UnifiedEventInput,
  UnifiedEventOutput,
} from '@marketingautomation/event/types/model.unified';
import { IListService } from '@marketingautomation/list/types';
import {
  UnifiedListInput,
  UnifiedListOutput,
} from '@marketingautomation/list/types/model.unified';
import { IMessageService } from '@marketingautomation/message/types';
import {
  UnifiedMessageInput,
  UnifiedMessageOutput,
} from '@marketingautomation/message/types/model.unified';
import { ITemplateService } from '@marketingautomation/template/types';
import {
  UnifiedTemplateInput,
  UnifiedTemplateOutput,
} from '@marketingautomation/template/types/model.unified';
import { IContactService } from '@ticketing/contact/types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';
import { IUserService } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';

export enum MarketingAutomationObject {
  action = 'action',
  automation = 'automation',
  campaign = 'campaign',
  contact = 'contact',
  email = 'email',
  event = 'event',
  list = 'list',
  message = 'message',
  template = 'template',
  user = 'user',
}

export type UnifiedMarketingAutomation =
  | UnifiedActionInput
  | UnifiedActionOutput
  | UnifiedAutomationInput
  | UnifiedAutomationOutput
  | UnifiedCampaignInput
  | UnifiedCampaignOutput
  | UnifiedContactInput
  | UnifiedContactOutput
  | UnifiedEmailInput
  | UnifiedEmailOutput
  | UnifiedEventInput
  | UnifiedEventOutput
  | UnifiedListInput
  | UnifiedListOutput
  | UnifiedMessageInput
  | UnifiedMessageOutput
  | UnifiedTemplateInput
  | UnifiedTemplateOutput
  | UnifiedUserInput
  | UnifiedUserOutput;

/*export const unificationMapping = {
  [MarketingAutomationObject.action]: actionUnificationMapping,
  [MarketingAutomationObject.automation]: automationUnificationMapping,
  [MarketingAutomationObject.campaign]: campaignUnificationMapping,
  [MarketingAutomationObject.contact]: contactUnificationMapping,
  [MarketingAutomationObject.email]: emailUnificationMapping,
  [MarketingAutomationObject.event]: eventUnificationMapping,
  [MarketingAutomationObject.list]: listUnificationMapping,
  [MarketingAutomationObject.message]: messageUnificationMapping,
  [MarketingAutomationObject.template]: templateUnificationMapping,
  [MarketingAutomationObject.user]: userUnificationMapping,
};*/

export type IMarketingAutomationService =
  | IActionService
  | IAutomationService
  | ICampaignService
  | IContactService
  | IEmailService
  | IEventService
  | IListService
  | IMessageService
  | ITemplateService
  | IUserService;

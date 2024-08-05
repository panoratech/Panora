import { IActionService } from '@marketingautomation/action/types';
import {
  UnifiedMarketingautomationActionInput,
  UnifiedMarketingautomationActionOutput,
} from '@marketingautomation/action/types/model.unified';
import { IAutomationService } from '@marketingautomation/automation/types';
import {
  UnifiedMarketingautomationAutomationInput,
  UnifiedMarketingautomationAutomationOutput,
} from '@marketingautomation/automation/types/model.unified';
import { ICampaignService } from '@marketingautomation/campaign/types';
import {
  UnifiedMarketingautomationCampaignInput,
  UnifiedMarketingautomationCampaignOutput,
} from '@marketingautomation/campaign/types/model.unified';
import { IEmailService } from '@marketingautomation/email/types';
import {
  UnifiedMarketingautomationEmailInput,
  UnifiedMarketingautomationEmailOutput,
} from '@marketingautomation/email/types/model.unified';
import { IEventService } from '@marketingautomation/event/types';
import {
  UnifiedMarketingautomationEventInput,
  UnifiedMarketingautomationEventOutput,
} from '@marketingautomation/event/types/model.unified';
import { IListService } from '@marketingautomation/list/types';
import {
  UnifiedMarketingautomationListInput,
  UnifiedMarketingautomationListOutput,
} from '@marketingautomation/list/types/model.unified';
import { IMessageService } from '@marketingautomation/message/types';
import {
  UnifiedMarketingautomationMessageInput,
  UnifiedMarketingautomationMessageOutput,
} from '@marketingautomation/message/types/model.unified';
import { ITemplateService } from '@marketingautomation/template/types';
import {
  UnifiedMarketingautomationTemplateInput,
  UnifiedMarketingautomationTemplateOutput,
} from '@marketingautomation/template/types/model.unified';
import { IContactService } from '@ticketing/contact/types';
import {
  UnifiedMarketingautomationContactInput,
  UnifiedMarketingautomationContactOutput,
} from '@marketingautomation/contact/types/model.unified';
import { IUserService } from '@ticketing/user/types';
import {
  UnifiedMarketingautomationUserInput,
  UnifiedMarketingautomationUserOutput,
} from '@marketingautomation/user/types/model.unified';

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
  | UnifiedMarketingautomationActionInput
  | UnifiedMarketingautomationActionOutput
  | UnifiedMarketingautomationAutomationInput
  | UnifiedMarketingautomationAutomationOutput
  | UnifiedMarketingautomationCampaignInput
  | UnifiedMarketingautomationCampaignOutput
  | UnifiedMarketingautomationContactInput
  | UnifiedMarketingautomationContactOutput
  | UnifiedMarketingautomationEmailInput
  | UnifiedMarketingautomationEmailOutput
  | UnifiedMarketingautomationEventInput
  | UnifiedMarketingautomationEventOutput
  | UnifiedMarketingautomationListInput
  | UnifiedMarketingautomationListOutput
  | UnifiedMarketingautomationMessageInput
  | UnifiedMarketingautomationMessageOutput
  | UnifiedMarketingautomationTemplateInput
  | UnifiedMarketingautomationTemplateOutput
  | UnifiedMarketingautomationUserInput
  | UnifiedMarketingautomationUserOutput;

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

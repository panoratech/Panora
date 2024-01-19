import { ICompanyService } from '@crm/company/types';
import { companyUnificationMapping } from '@crm/company/types/mappingsTypes';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { IContactService } from '@crm/contact/types';
import { contactUnificationMapping } from '@crm/contact/types/mappingsTypes';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IDealService } from '@crm/deal/types';
import { dealUnificationMapping } from '@crm/deal/types/mappingsTypes';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IEngagementService } from '@crm/engagement/types';
import { engagementUnificationMapping } from '@crm/engagement/types/mappingsTypes';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';

import { INoteService } from '@crm/note/types';
import { noteUnificationMapping } from '@crm/note/types/mappingsTypes';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { IStageService } from '@crm/stage/types';
import { stageUnificationMapping } from '@crm/stage/types/mappingsTypes';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { ITaskService } from '@crm/task/types';
import { taskUnificationMapping } from '@crm/task/types/mappingsTypes';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { IUserService } from '@crm/user/types/';
import { userUnificationMapping } from '@crm/user/types/mappingsTypes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@crm/user/types/model.unified';

export enum CrmObject {
  company = 'company',
  contact = 'contact',
  deal = 'deal',
  lead = 'lead',
  note = 'note',
  task = 'task',
  engagement = 'engagement',
  engagement_call = 'engagement_call',
  engagement_meeting = 'engagement_meeting',
  engagement_email = 'engagement_email',
  stage = 'stage',
  user = 'user',
}

export type UnifiedCrm =
  | UnifiedContactInput
  | UnifiedContactOutput
  | UnifiedCompanyInput
  | UnifiedCompanyOutput
  | UnifiedDealInput
  | UnifiedDealOutput
  | UnifiedEngagementInput
  | UnifiedEngagementOutput
  | UnifiedNoteInput
  | UnifiedNoteOutput
  | UnifiedStageInput
  | UnifiedStageOutput
  | UnifiedTaskInput
  | UnifiedTaskOutput
  | UnifiedUserInput
  | UnifiedUserOutput;

export const unificationMapping = {
  [CrmObject.contact]: contactUnificationMapping,
  [CrmObject.deal]: dealUnificationMapping,
  [CrmObject.company]: companyUnificationMapping,
  [CrmObject.engagement]: engagementUnificationMapping,
  [CrmObject.note]: noteUnificationMapping,
  [CrmObject.stage]: stageUnificationMapping,
  [CrmObject.task]: taskUnificationMapping,
  [CrmObject.user]: userUnificationMapping,
};

export type ICrmService =
  | IContactService
  | IUserService
  | IEngagementService
  | INoteService
  | IDealService
  | ITaskService
  | IStageService
  | ICompanyService;

/* contact */
export * from '../../contact/services/freshsales/types';
export * from '../../contact/services/zendesk/types';
export * from '../../contact/services/hubspot/types';
export * from '../../contact/services/zoho/types';
export * from '../../contact/services/pipedrive/types';

/* user */
export * from '../../user/services/freshsales/types';
export * from '../../user/services/zendesk/types';
export * from '../../user/services/hubspot/types';
export * from '../../user/services/zoho/types';
export * from '../../user/services/pipedrive/types';

/* engagement */
export * from '../../engagement/services/freshsales/types';
export * from '../../engagement/services/zendesk/types';
export * from '../../engagement/services/hubspot/types';
export * from '../../engagement/services/zoho/types';
export * from '../../engagement/services/pipedrive/types';

/* note */
export * from '../../note/services/freshsales/types';
export * from '../../note/services/zendesk/types';
export * from '../../note/services/hubspot/types';
export * from '../../note/services/zoho/types';
export * from '../../note/services/pipedrive/types';

/* deal */
export * from '../../deal/services/freshsales/types';
export * from '../../deal/services/zendesk/types';
export * from '../../deal/services/hubspot/types';
export * from '../../deal/services/zoho/types';
export * from '../../deal/services/pipedrive/types';

/* task */
export * from '../../task/services/freshsales/types';
export * from '../../task/services/zendesk/types';
export * from '../../task/services/hubspot/types';
export * from '../../task/services/zoho/types';
export * from '../../task/services/pipedrive/types';

/* stage */
export * from '../../stage/services/freshsales/types';
export * from '../../stage/services/zendesk/types';
export * from '../../stage/services/hubspot/types';
export * from '../../stage/services/zoho/types';
export * from '../../stage/services/pipedrive/types';

/* company */
export * from '../../company/services/freshsales/types';
export * from '../../company/services/zendesk/types';
export * from '../../company/services/hubspot/types';
export * from '../../company/services/zoho/types';
export * from '../../company/services/pipedrive/types';

/* engagementType */

export class Email {
  @ApiProperty({
    description: 'The email address',
  })
  email_address: string;

  @ApiProperty({
    description: 'The email address type',
  })
  email_address_type: string;

  @ApiPropertyOptional({
    description: 'The owner type of an email',
  })
  owner_type?: string;
}

export class Phone {
  @ApiProperty({
    description: 'The phone number',
  })
  phone_number: string;

  @ApiProperty({
    description: 'The phone type',
  })
  phone_type: string;

  @ApiPropertyOptional({ description: 'The owner type of a phone number' })
  owner_type?: string;
}
export class Address {
  @ApiProperty({
    description: 'The street',
  })
  street_1: string;

  @ApiProperty({
    description: 'More information about the street ',
  })
  street_2?: string;

  @ApiProperty({
    description: 'The city',
  })
  city: string;

  @ApiProperty({
    description: 'The state',
  })
  state: string;

  @ApiProperty({
    description: 'The postal code',
  })
  postal_code: string;

  @ApiProperty({
    description: 'The country',
  })
  country: string;

  @ApiProperty({
    description: 'The address type',
  })
  address_type?: string;

  @ApiProperty({
    description: 'The owner type of the address',
  })
  owner_type?: string;
}

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};

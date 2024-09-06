import { AccountingObjectOutput } from './original/original.accounting';
import { AtsObjectOutput } from './original/original.ats';
import { CrmObjectOutput } from './original/original.crm';
import { EcommerceObjectOutput } from './original/original.ecommerce';
import { FileStorageObjectOutput } from './original/original.file-storage';
import { HrisObjectOutput } from './original/original.hris';
import { MarketingAutomationObjectOutput } from './original/original.marketing-automation';
import { TicketingObjectOutput } from './original/original.ticketing';

export type UnifySourceType =
  | CrmObjectOutput
  | TicketingObjectOutput
  | AtsObjectOutput
  | MarketingAutomationObjectOutput
  | AccountingObjectOutput
  | FileStorageObjectOutput
  | HrisObjectOutput
  | EcommerceObjectOutput;

import { AccountingObjectOutput } from './original/original.accounting';
import { CrmObjectOutput } from './original/original.crm';
import { EcommerceObjectOutput } from './original/original.ecommerce';
import { FileStorageObjectOutput } from './original/original.file-storage';
import { MarketingAutomationObjectOutput } from './original/original.marketing-automation';
import { TicketingObjectOutput } from './original/original.ticketing';

export type UnifySourceType =
  | CrmObjectOutput
  | TicketingObjectOutput
  | MarketingAutomationObjectOutput
  | AccountingObjectOutput
  | FileStorageObjectOutput
  | EcommerceObjectOutput;

import { AccountingObjectInput } from './original/original.accounting';
import { CrmObjectInput } from './original/original.crm';
import { EcommerceObjectInput } from './original/original.ecommerce';
import { FileStorageObjectInput } from './original/original.file-storage';
import { MarketingAutomationObjectInput } from './original/original.marketing-automation';
import { TicketingObjectInput } from './original/original.ticketing';

export type DesunifyReturnType =
  | CrmObjectInput
  | TicketingObjectInput
  | MarketingAutomationObjectInput
  | AccountingObjectInput
  | FileStorageObjectInput
  | EcommerceObjectInput;

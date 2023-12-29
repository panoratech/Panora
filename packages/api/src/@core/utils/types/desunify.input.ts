import { AccountingObjectInput } from './original/original.accounting';
import { AtsObjectInput } from './original/original.ats';
import { CrmObjectInput } from './original/original.crm';
import { FileStorageObjectInput } from './original/original.file-storage';
import { HrisObjectInput } from './original/original.hris';
import { MarketingAutomationObjectInput } from './original/original.marketing-automation';
import { TicketingObjectInput } from './original/original.ticketing';

export type DesunifyReturnType =
  | CrmObjectInput
  | TicketingObjectInput
  | AtsObjectInput
  | MarketingAutomationObjectInput
  | AccountingObjectInput
  | FileStorageObjectInput
  | HrisObjectInput;

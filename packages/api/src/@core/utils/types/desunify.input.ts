import {
  AtsObjectInput,
  CrmObjectInput,
  TicketingObjectInput,
  MarketingAutomationObjectInput,
  FileStorageObjectInput,
  AccountingObjectInput,
  HrisObjectInput,
} from './original.input';

export type DesunifyReturnType =
  | CrmObjectInput
  | TicketingObjectInput
  | AtsObjectInput
  | MarketingAutomationObjectInput
  | AccountingObjectInput
  | FileStorageObjectInput
  | HrisObjectInput;

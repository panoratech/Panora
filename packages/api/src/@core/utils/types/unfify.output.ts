import {
  AccountingObjectOutput,
  AtsObjectOutput,
  CrmObjectOutput,
  FileStorageObjectOutput,
  HrisObjectOutput,
  MarketingAutomationObjectOutput,
  TicketingObjectOutput,
} from './original.output';

export type UnifySourceType =
  | CrmObjectOutput
  | TicketingObjectOutput
  | AtsObjectOutput
  | MarketingAutomationObjectOutput
  | AccountingObjectOutput
  | FileStorageObjectOutput
  | HrisObjectOutput;

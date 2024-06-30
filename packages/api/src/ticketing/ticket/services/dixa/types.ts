export type DixaTicketInput = Partial<CreateConversationPayload>;
export type DixaTicketOutput = Conversation;

interface CreateConversationPayload {
  requesterId: string;
  emailIntegrationId: string;
  subject: string;
  message: Message;
  language: string;
  _type: string;
}

interface Message {
  content: Content;
  attachments: any[];
  _type: string;
}

interface Content {
  value: string;
  _type: string;
}

interface Conversation {
  id: number;
  requesterId: string;
  channel: string;
  createdAt: string;
  direction: string;
  state: string;
  stateUpdatedAt: string;
  assignment: Assignment;
  queue: Queue;
  browserInfo: BrowserInfo;
  language: string;
  link: Link;
  customAttributes: CustomAttribute[];
  _type: string;
}

interface Assignment {
  agentId: string;
  assignedAt: string;
}

interface Queue {
  id: string;
  queuedAt: string;
}

interface BrowserInfo {
  name: string;
  version: string;
  ipAddress: string;
  originatingUrl: string;
}

interface Link {
  parentId: number;
  _type: string;
}

interface CustomAttribute {
  id: string;
  name: string;
  identifier: string;
  value: string;
}

export class UnifiedAttachmentInput {
  field_mappings?: Record<string, any>[];
}

export class UnifiedAttachmentOutput extends UnifiedAttachmentInput {
  id: string;
}

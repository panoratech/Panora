export class UnifiedAttachmentInput {
  file_name: string;
  file_url: string;
  uploader?: string;
  field_mappings?: Record<string, any>[];
}

export class UnifiedAttachmentOutput extends UnifiedAttachmentInput {
  id: string;
}

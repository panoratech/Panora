import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedAttachmentInput {
  file_name: string;
  file_url: string;
  uploader?: string;
  field_mappings?: Record<string, any>[];
}

export class UnifiedAttachmentOutput extends UnifiedAttachmentInput {
  @ApiPropertyOptional({
    description: 'The id of the attachment',
    type: String,
  })
  id?: string;
  @ApiPropertyOptional({
    description:
      'The id of the attachment in the context of the Ticketing software',
    type: String,
  })
  remote_id?: string;
}

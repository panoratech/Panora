import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedAttachmentInput {
  @ApiProperty({ description: 'The file name of the attachment' })
  file_name: string;

  @ApiProperty({ description: 'The file url of the attachment' })
  file_url: string;

  @ApiProperty({ description: "The uploader's uuid of the attachment" })
  uploader?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the attachment between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedAttachmentOutput extends UnifiedAttachmentInput {
  @ApiPropertyOptional({ description: 'The uuid of the attachment' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the attachment in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the attachment in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}

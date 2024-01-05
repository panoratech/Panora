import { IAttachmentMapper } from '@ticketing/attachment/types';
import { FrontAttachmentInput, FrontAttachmentOutput } from './types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';

export class FrontAttachmentMapper implements IAttachmentMapper {
  desunify(
    source: UnifiedAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontAttachmentInput {
    return;
  }

  unify(
    source: FrontAttachmentOutput | FrontAttachmentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput | UnifiedAttachmentOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((ticket) =>
      this.mapSingleTicketToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleTicketToUnified(
    ticket: FrontAttachmentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput {
    return;
  }
}

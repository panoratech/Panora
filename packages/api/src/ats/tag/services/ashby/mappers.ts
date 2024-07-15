import { AshbyTagInput, AshbyTagOutput } from './types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ats/tag/types/model.unified';
import { ITagMapper } from '@ats/tag/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import {
  OriginalAttachmentOutput,
  OriginalTagOutput,
} from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { UnifiedAttachmentOutput } from '@ats/attachment/types/model.unified';

@Injectable()
export class AshbyTagMapper implements ITagMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'tag', 'ashby', this);
  }

  async desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyTagInput> {
    return;
  }

  async unify(
    source: AshbyTagOutput | AshbyTagOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTagOutput | UnifiedTagOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleTagToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyTagOutput
    return Promise.all(
      source.map((tag) =>
        this.mapSingleTagToUnified(tag, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleTagToUnified(
    tag: AshbyTagOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTagOutput> {
    return {
      remote_id: tag.id,
      remote_data: tag,
      name: tag.title,
    };
  }
}

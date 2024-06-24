import { BoxFolderInput, BoxFolderOutput } from './types';
import {
  UnifiedFolderInput,
  UnifiedFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { IFolderMapper } from '@filestorage/folder/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoxFolderMapper implements IFolderMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('filestorage', 'folder', 'box', this);
  }

  async desunify(
    source: UnifiedFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxFolderInput> {
    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }
    return;
  }

  async unify(
    source: BoxFolderOutput | BoxFolderOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFolderOutput | UnifiedFolderOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleFolderToUnified(source, customFieldMappings);
    }
    // Handling array of BoxFolderOutput
    return Promise.all(
      source.map((folder) =>
        this.mapSingleFolderToUnified(folder, customFieldMappings),
      ),
    );
  }

  private async mapSingleFolderToUnified(
    folder: BoxFolderOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFolderOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = folder[mapping.remote_id];
      }
    }

    return;
  }
}

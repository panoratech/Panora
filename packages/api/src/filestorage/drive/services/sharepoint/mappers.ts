import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@filestorage/@lib/@utils';
import {
  UnifiedFilestorageDriveInput,
  UnifiedFilestorageDriveOutput,
} from '@filestorage/drive/types/model.unified';
import { Injectable } from '@nestjs/common';
import { SharepointDriveInput, SharepointDriveOutput } from './types';
import { IDriveMapper } from '@filestorage/drive/types';

@Injectable()
export class SharepointDriveMapper implements IDriveMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'drive',
      'sharepoint',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageDriveInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SharepointDriveInput> {
    return;
  }

  async unify(
    source: SharepointDriveOutput | SharepointDriveOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageDriveOutput | UnifiedFilestorageDriveOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDriveToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of SharepointDriveOutput
    return Promise.all(
      source.map((drive) =>
        this.mapSingleDriveToUnified(drive, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDriveToUnified(
    drive: SharepointDriveOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageDriveOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = drive[mapping.remote_id];
      }
    }

    const result: UnifiedFilestorageDriveOutput = {
      remote_id: drive.id,
      remote_data: drive,
      name: drive.name,
      remote_created_at: drive.createdDateTime,
      drive_url: drive.webUrl,
      field_mappings,
    };

    return result;
  }
}

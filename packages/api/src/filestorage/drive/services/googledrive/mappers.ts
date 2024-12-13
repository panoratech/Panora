import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@filestorage/@lib/@utils';
import {
  UnifiedFilestorageDriveInput,
  UnifiedFilestorageDriveOutput,
} from '@filestorage/drive/types/model.unified';
import { Injectable } from '@nestjs/common';
import { GoogleDriveDriveInput, GoogleDriveDriveOutput } from './types';
import { IDriveMapper } from '@filestorage/drive/types';

@Injectable()
export class GoogleDriveMapper implements IDriveMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'drive',
      'googledrive',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageDriveInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GoogleDriveDriveInput> {
    return {
      name: source.name,
    };
  }

  async unify(
    source: GoogleDriveDriveOutput | GoogleDriveDriveOutput[],
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
    return Promise.all(
      source.map((drive) =>
        this.mapSingleDriveToUnified(drive, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDriveToUnified(
    drive: GoogleDriveDriveOutput,
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
      remote_created_at: drive.createdTime
        ? new Date(drive.createdTime).toISOString()
        : null,
      drive_url: `https://drive.google.com/drive/folders/${drive.id}`,
      field_mappings,
    };
    return result;
  }
}

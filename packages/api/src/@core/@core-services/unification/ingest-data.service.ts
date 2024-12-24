import { Injectable } from '@nestjs/common';
import { CoreSyncRegistry } from '../registries/core-sync.registry';
import { CoreUnification } from './core-unification.service';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApiResponse,
  getFileExtensionFromMimeType,
  TargetObject,
} from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { WebhookService } from '../webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { LoggerService } from '../logger/logger.service';
import { fs_files as FileStorageFile } from '@prisma/client';

@Injectable()
export class IngestDataService {
  constructor(
    private syncRegistry: CoreSyncRegistry,
    private coreUnification: CoreUnification,
    private webhook: WebhookService,
    private prisma: PrismaService,
    private connectionUtils: ConnectionUtils,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
  ) {}

  async syncForLinkedUser<T, U, V extends IBaseObjectService>(
    integrationId: string,
    linkedUserId: string,
    vertical: string,
    commonObject: string,
    service: V,
    params: {
      param: any;
      paramName: string;
      shouldPassToService: boolean;
      shouldPassToIngest: boolean;
    }[],
    wh_real_time_trigger?: {
      action: 'UPDATE' | 'DELETE';
      data: {
        remote_id: string;
      };
    },
  ): Promise<void> {
    try {
      this.logger.log(
        `Syncing ${integrationId} ${commonObject}s for linkedUser ${linkedUserId}`,
      );

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: vertical,
        },
      });

      if (!connection) {
        this.logger.warn(
          `Skipping ${commonObject}s syncing... No ${integrationId} connection was found for linked user ${linkedUserId}`,
        );
        return;
      }

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          `${vertical}.${commonObject}`,
        );

      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const serviceParams = params
        .filter((p) => p.shouldPassToService)
        .map((p) => p.param);

      const ingestParams = params
        .filter((p) => p.shouldPassToIngest)
        .reduce((acc, p) => ({ ...acc, [p.paramName]: p.param }), {});

      // Construct the syncParam object dynamically
      const syncParam: SyncParam = {
        linkedUserId,
        custom_properties: remoteProperties,
        custom_field_mappings: customFieldMappings,
        ingestParams: ingestParams,
      };

      serviceParams.forEach((param, index) => {
        const paramName = params[index].paramName;
        syncParam[paramName] = param;
      });

      let resp: ApiResponse<U[]>;
      try {
        if (wh_real_time_trigger && wh_real_time_trigger.data.remote_id) {
          switch (wh_real_time_trigger.action) {
            case 'DELETE':
              await this.syncRegistry
                .getService(vertical, commonObject)
                .removeInDb(
                  connection.id_connection,
                  wh_real_time_trigger.data.remote_id,
                );
            default:
              syncParam.webhook_remote_identifier =
                wh_real_time_trigger.data.remote_id;
              resp = await service.sync(syncParam);
              break;
          }
        } else {
          resp = await service.sync(syncParam);
        }

        if (!resp || !resp.data) {
          this.logger.warn(
            `Sync operation for ${integrationId} ${commonObject} returned no data`,
          );
          return;
        }

        const sourceObject: U[] = resp.data;

        await this.ingestData<T, U>(
          sourceObject,
          integrationId,
          connection.id_connection,
          vertical,
          commonObject,
          customFieldMappings,
          ingestParams,
        );
      } catch (syncError) {
        console.log(syncError, 'syncError in ingest-data.service.ts');
        this.logger.error(
          `Error syncing ${integrationId} ${commonObject}: ${syncError.message}`,
          syncError,
        );
        // Optionally, you could create an event to log this error
        /*await this.prisma.events.create({
        data: {
          id_connection: connection.id_connection,
          id_project: connection.id_project,
          id_event: uuidv4(),
          status: 'error',
          type: `${vertical}.${commonObject}.sync_failed`,
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          error: syncError.message,
        },
      });*/
      }
    } catch (error) {
      throw error;
    }
  }

  async ingestData<T, U = UnifySourceType>(
    sourceObject: U[],
    integrationId: string,
    connectionId: string,
    vertical: string,
    commonObject: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    extraParams?: { [key: string]: any },
  ): Promise<any[]> {
    const unifiedObject = (await this.coreUnification.unify<U[]>({
      sourceObject,
      targetType: commonObject as TargetObject,
      providerName: integrationId,
      vertical: vertical,
      connectionId: connectionId,
      customFieldMappings,
      extraParams,
    })) as T[];

    if (unifiedObject == null) {
    }
    const { linkedUserId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionId(
        connectionId,
      );

    // insert the data in the DB with the fieldMappings (value table)
    const data = await this.syncRegistry
      .getService(vertical, commonObject)
      .saveToDb(
        connectionId,
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
        ...Object.values(extraParams || {}),
      );

    // insert the files in our s3 bucket so we can process them for our RAG
    /*if (vertical === 'filestorage' && commonObject === 'file') {
      try {
        const filesInfo: FileInfo[] = data
          .filter((file: FileStorageFile) => file.mime_type !== null)
          .map((file: FileStorageFile) => ({
            id: file.id_fs_file,
            url: file.file_url,
            provider: integrationId,
            s3Key: `${projectId}/${linkedUserId}/${
              file.id_fs_file
            }.${getFileExtensionFromMimeType(file.mime_type)}`,
            fileType: getFileExtensionFromMimeType(file.mime_type),
          }));

        if (filesInfo.length > 0) {
          this.logger.log('During sync, found files to process for RAG...');
          await this.ragService.queueDocumentProcessing(
            filesInfo,
            projectId,
            linkedUserId,
          );
        }
      } catch (ragError) {
        this.logger.error(
          `Error processing files for RAG: ${ragError.message}`,
          ragError.stack,
        );
        // Optionally, you could create an event to log this error
        // await this.prisma.events.create({...});
      }
    }*/

    const event = await this.prisma.events.create({
      data: {
        id_connection: connectionId,
        id_project: projectId,
        id_event: uuidv4(),
        status: 'success',
        type: `${vertical}.${commonObject}.pulled`,
        method: 'SYNC',
        url: '/sync',
        provider: integrationId,
        direction: '0',
        timestamp: new Date(),
        id_linked_user: linkedUserId,
      },
    });
    await this.webhook.dispatchWebhook(
      data,
      `${vertical}.${commonObject}.pulled`,
      projectId,
      event.id_event,
    );
    return data;
  }

  async processFieldMappings(
    field_mappings: Record<string, any>,
    ressource_owner_id: string,
    originSource: string,
    linkedUserId: string,
  ) {
    if (field_mappings && field_mappings.length > 0) {
      const entity = await this.prisma.entity.create({
        data: {
          id_entity: uuidv4(),
          ressource_owner_id: ressource_owner_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      for (const [slug, value] of Object.entries(field_mappings)) {
        const attribute = await this.prisma.attribute.findFirst({
          where: {
            slug: slug,
            source: originSource,
            id_consumer: linkedUserId,
          },
        });

        if (attribute) {
          await this.prisma.value.create({
            data: {
              id_value: uuidv4(),
              data: value || 'null',
              attribute: { connect: { id_attribute: attribute.id_attribute } },
              entity: { connect: { id_entity: entity.id_entity } },
              created_at: new Date(),
              modified_at: new Date(),
            },
          });
        }
      }
    }
  }

  async processRemoteData(ressource_owner_id: string, remote_data: any) {
    await this.prisma.remote_data.upsert({
      where: { ressource_owner_id: ressource_owner_id },
      create: {
        id_remote_data: uuidv4(),
        ressource_owner_id: ressource_owner_id,
        format: 'json',
        data: JSON.stringify(remote_data),
        created_at: new Date(),
      },
      update: {
        data: JSON.stringify(remote_data),
        created_at: new Date(),
      },
    });
  }
}

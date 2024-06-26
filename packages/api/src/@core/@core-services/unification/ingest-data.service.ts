import { Injectable } from '@nestjs/common';
import { CoreSyncRegistry } from '../registries/core-sync.registry';
import { CoreUnification } from './core-unification.service';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { TargetObject } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { WebhookService } from '../webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';

@Injectable()
export class IngestDataService {
  constructor(
    private syncRegistry: CoreSyncRegistry,
    private coreUnification: CoreUnification,
    private webhook: WebhookService,
    private prisma: PrismaService,
    private connectionUtils: ConnectionUtils,
  ) {}

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
  ): Promise<any[]> {
    const unifiedObject = (await this.coreUnification.unify<U[]>({
      sourceObject,
      targetType: commonObject as TargetObject,
      providerName: integrationId,
      vertical: vertical,
      connectionId: connectionId,
      customFieldMappings,
    })) as T[];

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
      );
    const event = await this.prisma.events.create({
      data: {
        id_event: uuidv4(),
        status: 'success',
        type: `${vertical}.${commonObject}.synced`,
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
}

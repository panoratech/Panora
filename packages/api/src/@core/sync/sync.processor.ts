import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queues } from '@@core/@core-services/queues/types';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';

@Injectable()
@Processor(Queues.SYNC_JOBS_WORKER)
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private registry: CoreSyncRegistry) {}

  @Process('*')
  async handleSyncJob(job: Job) {
    const { projectId, vertical, commonObject } = job.data;
    this.logger.log(
      `Starting to process job ${job.id} for ${vertical} ${commonObject} (Project: ${projectId})`,
    );

    try {
      const service = this.registry.getService(vertical, commonObject);
      if (!service) {
        this.logger.warn(
          `No service found for vertical ${vertical} and common object ${commonObject}`,
        );
        return { status: 'skipped', reason: 'No service found' };
      }

      await service.kickstartSync(projectId);
      this.logger.log(
        `Successfully processed job ${job.id} for ${vertical} ${commonObject} (Project: ${projectId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id} for ${vertical} ${commonObject} (Project: ${projectId})`,
        error.stack,
      );
      return { status: 'failed', error: error.message };
    }
  }

  @Process('health-check')
  async healthCheck(job: Job) {
    this.logger.log(`Health check job ${job.id} received`);
    return { status: 'OK', timestamp: new Date() };
  }
}

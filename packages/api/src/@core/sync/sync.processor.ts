import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { Queues } from '@@core/@core-services/queues/types';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';

@Injectable()
@Processor(Queues.SYNC_JOBS_WORKER)
export class SyncProcessor {
  constructor(private registry: CoreSyncRegistry) {}

  @Process('*')
  async handleSyncJob(job: Job) {
    const { projectId, vertical, commonObject } = job.data;
    try {
      console.log(`Processing queue -> ${job.name} for project ${projectId}`);
      await this.registry
        .getService(vertical, commonObject)
        .kickstartSync(projectId);
    } catch (error) {
      console.error(`Error syncing ${vertical} ${commonObject}`, error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';
import { Queues } from '@@core/@core-services/queues/types';

@Processor(Queues.SYNC_JOBS_WORKER)
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ecommerce-sync-fulfillments')
  async handleSyncFulfillments(job: Job) {
    try {
      console.log(`Processing queue -> ecommerce-sync-fulfillments ${job.id}`);
      await this.syncService.kickstartSync();
    } catch (error) {
      console.error('Error syncing ecommerce fulfillments', error);
    }
  }
}

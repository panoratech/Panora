import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';
import { Queues } from '@@core/@core-services/queues/types';

@Processor(Queues.SYNC_JOBS_WORKER)
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process({ name: 'crm-sync-contacts', concurrency: 5 })
  async handleSyncContacts(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-contacts ${job.id}`);
      await this.syncService.kickstartSync();
    } catch (error) {
      console.error('Error syncing crm contacts', error);
    }
  }
}

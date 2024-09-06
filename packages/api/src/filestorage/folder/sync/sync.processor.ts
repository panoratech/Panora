import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';
import { Queues } from '@@core/@core-services/queues/types';

@Processor(Queues.SYNC_JOBS_WORKER)
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('filestorage-sync-folders')
  async handleSyncFolders(job: Job) {
    try {
      console.log(`Processing queue -> filestorage-sync-folders ${job.id}`);
      await this.syncService.kickstartSync();
    } catch (error) {
      console.error('Error syncing filestorage folders', error);
    }
  }
}

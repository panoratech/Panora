import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('crm-sync-engagements')
  async handleSyncEngagements(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-engagements ${job.id}`);
      await this.syncService.syncEngagements();
    } catch (error) {
      console.error('Error syncing crm engagements', error);
    }
  }
}

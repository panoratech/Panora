import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-eeocs')
  async handleSyncEeocs(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-eeocs ${job.id}`);
      await this.syncService.syncEeocs();
    } catch (error) {
      console.error('Error syncing ats eeocs', error);
    }
  }
}

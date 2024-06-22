import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-tags')
  async handleSyncTags(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-tags ${job.id}`);
      await this.syncService.syncTags();
    } catch (error) {
      console.error('Error syncing ats tags', error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-interviews')
  async handleSyncInterviews(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-interviews ${job.id}`);
      await this.syncService.syncInterviews();
    } catch (error) {
      console.error('Error syncing ats interviews', error);
    }
  }
}

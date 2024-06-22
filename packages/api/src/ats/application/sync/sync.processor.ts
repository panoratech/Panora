import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-applications')
  async handleSyncApplications(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-applications ${job.id}`);
      await this.syncService.syncApplications();
    } catch (error) {
      console.error('Error syncing ats applications', error);
    }
  }
}

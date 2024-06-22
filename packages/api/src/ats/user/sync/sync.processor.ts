import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-users')
  async handleSyncUsers(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-users ${job.id}`);
      await this.syncService.syncUsers();
    } catch (error) {
      console.error('Error syncing ats users', error);
    }
  }
}

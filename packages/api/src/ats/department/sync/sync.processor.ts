import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-departments')
  async handleSyncDepartments(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-departments ${job.id}`);
      await this.syncService.syncDepartments();
    } catch (error) {
      console.error('Error syncing ats departments', error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('crm-sync-tasks')
  async handleSyncTasks(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-tasks ${job.id}`);
      await this.syncService.syncTasks();
    } catch (error) {
      console.error('Error syncing crm tasks', error);
    }
  }
}

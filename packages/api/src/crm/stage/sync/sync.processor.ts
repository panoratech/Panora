import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('crm-sync-stages')
  async handleSyncStages(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-stages ${job.id}`);
      await this.syncService.syncStages();
    } catch (error) {
      console.error('Error syncing crm stages', error);
    }
  }
}

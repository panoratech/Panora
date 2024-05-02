import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('crm-sync-deals')
  async handleSyncDeals(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-deals ${job.id}`);
      await this.syncService.syncDeals();
    } catch (error) {
      console.error('Error syncing crm deals', error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('crm-sync-companies')
  async handleSyncCompanies(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-companies ${job.id}`);
      await this.syncService.syncCompanies();
    } catch (error) {
      console.error('Error syncing crm companies', error);
    }
  }
}

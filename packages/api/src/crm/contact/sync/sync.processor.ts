import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('crm-sync-contacts')
  async handleSyncCompanies(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-contacts ${job.id}`);
      await this.syncService.syncContacts();
    } catch (error) {
      console.error('Error syncing crm contacts', error);
    }
  }
}

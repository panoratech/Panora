import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';
import { Queues } from '@@core/@core-services/queues/types';

@Processor(Queues.SYNC_JOBS_WORKER)
export class SyncProcessor {
  constructor(private readonly syncService: SyncService) {}

  @Process('crm-sync-contacts')
  async handleSyncContacts(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-contacts ${job.id}`);
      await this.syncService.kickstartSync();
    } catch (error) {
      console.error('Error syncing CRM contacts', error);
    }
  }

  @Process('crm-sync-notes')
  async handleSyncNotes(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-notes ${job.id}`);
      await this.syncService.kickstartSync();
    } catch (error) {
      console.error('Error syncing CRM notes', error);
    }
  }

  @Process('crm-sync-opportunities')
  async handleSyncOpportunities(job: Job) {
    try {
      console.log(`Processing queue -> crm-sync-opportunities ${job.id}`);
      await this.syncService.kickstartSync();
    } catch (error) {
      console.error('Error syncing CRM opportunities', error);
    }
  }
}

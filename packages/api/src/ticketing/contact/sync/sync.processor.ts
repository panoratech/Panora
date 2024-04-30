import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('ticketing-sync-contacts')
  async handleSyncContacts(job: Job) {
    try {
      console.log(`Processing queue -> ticketing-sync-contacts ${job.id}`);
      await this.syncService.syncContacts();
    } catch (error) {
      console.error('Error syncing ticketing contacts', error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('ticketing-sync-tickets')
  async handleSyncTickets(job: Job) {
    try {
      console.log(`Processing queue -> ticketing-sync-tickets ${job.id}`);
      await this.syncService.syncTickets();
    } catch (error) {
      console.error('Error syncing ticketing tickets', error);
    }
  }
}

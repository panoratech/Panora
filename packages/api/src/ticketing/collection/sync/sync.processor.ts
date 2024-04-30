import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('ticketing-sync-collections')
  async handleSyncCollections(job: Job) {
    try {
      console.log(`Processing queue -> ticketing-sync-collections ${job.id}`);
      await this.syncService.syncCollections();
    } catch (error) {
      console.error('Error syncing ticketing collections', error);
    }
  }
}

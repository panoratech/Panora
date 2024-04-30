import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('ticketing-sync-tags')
  async handleSyncTags(job: Job) {
    try {
      console.log(`Processing queue -> ticketing-sync-tags ${job.id}`);
      await this.syncService.syncTags();
    } catch (error) {
      console.error('Error syncing ticketing tags', error);
    }
  }
}

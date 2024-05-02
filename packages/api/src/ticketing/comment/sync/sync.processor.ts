import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('ticketing-sync-comments')
  async handleSyncComments(job: Job) {
    try {
      console.log(`Processing queue -> ticketing-sync-comments ${job.id}`);
      await this.syncService.syncComments();
    } catch (error) {
      console.error('Error syncing ticketing comments', error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-offices')
  async handleSyncOffices(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-offices ${job.id}`);
      await this.syncService.syncOffices();
    } catch (error) {
      console.error('Error syncing ats offices', error);
    }
  }
}

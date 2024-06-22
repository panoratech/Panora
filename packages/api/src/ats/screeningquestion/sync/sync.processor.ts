import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-candidates')
  async handleSyncCandidates(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-candidates ${job.id}`);
      await this.syncService.syncCandidates();
    } catch (error) {
      console.error('Error syncing ats candidates', error);
    }
  }
}

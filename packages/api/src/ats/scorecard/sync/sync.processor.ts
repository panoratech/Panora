import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-score-cards')
  async handleSyncScoreCards(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-score-cards ${job.id}`);
      await this.syncService.syncScoreCards();
    } catch (error) {
      console.error('Error syncing ats score cards', error);
    }
  }
}

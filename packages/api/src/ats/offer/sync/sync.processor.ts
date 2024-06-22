import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-offers')
  async handleSyncOffers(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-offers ${job.id}`);
      await this.syncService.syncOffers();
    } catch (error) {
      console.error('Error syncing ats offers', error);
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}
  @Process('ats-sync-activities')
  async handleSyncCompanies(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-activities ${job.id}`);
      await this.syncService.syncActivities();
    } catch (error) {
      console.error('Error syncing ats activities', error);
    }
  }
}

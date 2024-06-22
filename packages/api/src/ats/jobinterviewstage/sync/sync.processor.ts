import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-job-interview-stages')
  async handleSyncJobInterviewStages(job: Job) {
    try {
      console.log(
        `Processing queue -> ats-sync-job-interview-stages ${job.id}`,
      );
      await this.syncService.syncJobInterviewStages();
    } catch (error) {
      console.error('Error syncing ats job interview stages', error);
    }
  }
}

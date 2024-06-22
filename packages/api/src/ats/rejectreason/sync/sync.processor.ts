import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('ats-sync-reject-reasons')
  async handleSyncRejectReasons(job: Job) {
    try {
      console.log(`Processing queue -> ats-sync-reject-reasons ${job.id}`);
      await this.syncService.syncRejectReasons();
    } catch (error) {
      console.error('Error syncing ats reject reasons', error);
    }
  }
}

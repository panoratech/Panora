import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('filestorage-sync-drives')
  async handleSyncDrives(job: Job) {
    try {
      console.log(`Processing queue -> filestorage-sync-drives ${job.id}`);
      await this.syncService.syncDrives();
    } catch (error) {
      console.error('Error syncing filestorage drives', error);
    }
  }
}

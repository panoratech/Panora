import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('filestorage-sync-files')
  async handleSyncFiles(job: Job) {
    try {
      console.log(`Processing queue -> filestorage-sync-files ${job.id}`);
      await this.syncService.syncFiles();
    } catch (error) {
      console.error('Error syncing filestorage files', error);
    }
  }
}

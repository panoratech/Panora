import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('filestorage-sync-folders')
  async handleSyncFolders(job: Job) {
    try {
      console.log(`Processing queue -> filestorage-sync-folders ${job.id}`);
      await this.syncService.syncFolders();
    } catch (error) {
      console.error('Error syncing filestorage folders', error);
    }
  }
}

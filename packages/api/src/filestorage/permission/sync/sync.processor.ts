import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('syncTasks')
export class SyncProcessor {
  constructor(private syncService: SyncService) {}

  @Process('filestorage-sync-permissions')
  async handleSyncPermissions(job: Job) {
    try {
      console.log(`Processing queue -> filestorage-sync-permissions ${job.id}`);
      await this.syncService.syncPermissions();
    } catch (error) {
      console.error('Error syncing filestorage permissions', error);
    }
  }
}

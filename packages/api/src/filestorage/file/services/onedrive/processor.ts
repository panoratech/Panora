import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { Queues } from '@@core/@core-services/queues/types';
import { OnedriveService } from '.';

@Injectable()
@Processor(Queues.THIRD_PARTY_DATA_INGESTION)
export class OnedriveQueueProcessor {
  constructor(private readonly onedriveService: OnedriveService) {}

  @Process({ name: 'fs_file_onedrive', concurrency: 1 })
  async handleOneDriveSync(job: Job): Promise<void> {
    try {
      await this.onedriveService.processBatch(job);
    } catch (error) {
      console.error(`Failed to process OneDrive sync job: ${error.message}`);
      throw error;
    }
  }
}

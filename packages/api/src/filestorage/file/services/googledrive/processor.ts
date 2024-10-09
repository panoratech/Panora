import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { Queues } from '@@core/@core-services/queues/types';
import { GoogleDriveService } from '.';

@Injectable()
@Processor(Queues.THIRD_PARTY_DATA_INGESTION)
export class GoogleDriveQueueProcessor {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Process({ name: 'fs_file_googledrive', concurrency: 1 })
  async handleGoogleDriveSync(job: Job) {
    try {
      await this.googleDriveService.processBatch(job);
    } catch (error) {
      console.error(
        `Failed to process Google Drive sync job: ${error.message}`,
      );
      throw error;
    }
  }
}

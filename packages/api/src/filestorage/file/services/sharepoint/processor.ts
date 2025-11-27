import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { Queues } from '@@core/@core-services/queues/types';
import { SharepointService } from '.';

@Injectable()
@Processor(Queues.THIRD_PARTY_DATA_INGESTION)
export class SharepointQueueProcessor {
  constructor(private readonly sharepointService: SharepointService) {}

  @Process({ name: 'fs_file_sharepoint', concurrency: 1 })
  async handleSharePointSync(job: Job): Promise<void> {
    try {
      await this.sharepointService.processBatch(job);
    } catch (error) {
      console.error(`Failed to process SharePoint sync job: ${error.message}`);
      throw error;
    }
  }
}

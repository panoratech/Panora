import { Queues } from '@@core/@core-services/queues/types';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(Queues.RATE_LIMIT_FAILED_JOBS)
export class RateLimitJobProcessor {
  constructor(private ingestDataService: IngestDataService) {}

  @Process('rate-limit-sync')
  async processRateLimitedJob(job: Job<{ method: string; args: any[] }>) {
    const { method, args } = job.data;
    try {
      if (method === 'syncForLinkedUser') {
        await this.ingestDataService.syncForLinkedUser(
          ...(args as Parameters<
            typeof this.ingestDataService.syncForLinkedUser
          >),
        );
      }

      // Fallback for other methods (if any)
      /*const targetInstance = this.moduleRef.get(target, { strict: false });
      if (targetInstance && typeof targetInstance[method] === 'function') {
        await targetInstance[method](...args);
        return;
      }*/
    } catch (error) {
      console.error(`Error processing rate-limited job: ${error.message}`);
      throw error;
    }
  }
}

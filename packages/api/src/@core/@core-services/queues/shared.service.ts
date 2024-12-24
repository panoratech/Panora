import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Queues } from './types';

@Injectable()
export class BullQueueService {
  constructor(
    @InjectQueue(Queues.REMOTE_REAL_TIME_WEBHOOKS_RECEIVER)
    public readonly realTimeWebhookQueue: Queue,
    @InjectQueue(Queues.PANORA_WEBHOOKS_SENDER)
    public readonly panoraWebhookDeliveryQueue: Queue,
    @InjectQueue(Queues.SYNC_JOBS_WORKER)
    public readonly syncJobsQueue: Queue,
    @InjectQueue(Queues.FAILED_PASSTHROUGH_REQUESTS_HANDLER)
    public readonly failedPassthroughRequestsQueue: Queue,
    @InjectQueue(Queues.THIRD_PARTY_DATA_INGESTION)
    public readonly thirdPartyDataIngestionQueue: Queue,
    @InjectQueue(Queues.RAG_DOCUMENT_PROCESSING)
    private ragDocumentQueue: Queue,
  ) {}

  // getters
  getRealtimeWebhookReceiver() {
    return this.realTimeWebhookQueue;
  }
  getPanoraWebhookSender() {
    return this.panoraWebhookDeliveryQueue;
  }
  getSyncJobsQueue() {
    return this.syncJobsQueue;
  }
  getFailedPassthroughRequestsQueue() {
    return this.failedPassthroughRequestsQueue;
  }
  getRagDocumentQueue() {
    return this.ragDocumentQueue;
  }
  getThirdPartyDataIngestionQueue() {
    return this.thirdPartyDataIngestionQueue;
  }

  async removeRepeatableJob(jobName: string) {
    const jobs = await this.syncJobsQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncJobsQueue.removeRepeatableByKey(job.key);
      }
    }
  }

  async queueSyncJob(jobName: string, jobData: any, cron: string) {
    await this.removeRepeatableJob(jobName);
    const res = await this.syncJobsQueue.add(jobName, jobData, {
      repeat: { cron },
      jobId: jobName,
    });
    console.log('job is ' + JSON.stringify(res));
  }
}

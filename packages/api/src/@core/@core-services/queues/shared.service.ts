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
  ) {}

  // getters

  getRealtimeWebhookReceiver() {
    return this.realTimeWebhookQueue;
  }
  getPanoraWebhookSender() {
    return this.panoraWebhookDeliveryQueue;
  }

  // setters
  async queueSyncJob(jobName: string, cron: string) {
    const jobs = await this.syncJobsQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncJobsQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job with the job name
    await this.syncJobsQueue.add(
      jobName,
      {},
      {
        repeat: { cron },
        jobId: jobName, // Using jobId to identify repeatable jobs
      },
    );
  }
}

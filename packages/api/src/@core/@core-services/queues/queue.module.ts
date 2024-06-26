import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullQueueService } from './shared.service';
import { Queues } from './types';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: Queues.REMOTE_REAL_TIME_WEBHOOKS_RECEIVER,
      },
      {
        name: Queues.PANORA_WEBHOOKS_SENDER,
      },
      {
        name: Queues.SYNC_JOBS_WORKER,
      },
    ),
  ],
  providers: [BullQueueService],
  exports: [BullQueueService],
})
export class BullQueueModule {}

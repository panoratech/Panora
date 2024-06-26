export enum Queues {
  REMOTE_REAL_TIME_WEBHOOKS_RECEIVER = 'REMOTE_REAL_TIME_WEBHOOKS_RECEIVER', // Queue receives real time webhooks coming from remote 3rd parties
  PANORA_WEBHOOKS_SENDER = 'PANORA_WEBHOOKS_SENDER', // Queue sends Panora webhooks to clients listening for important events
  SYNC_JOBS_WORKER = 'SYNC_JOBS_WORKER', // Queue which syncs data from remote 3rd parties
}

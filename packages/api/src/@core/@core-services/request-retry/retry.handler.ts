import { PassthroughResponse } from '@@core/passthrough/types';
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { backOff } from 'exponential-backoff';
import { v4 as uuidv4 } from 'uuid';
import { BullQueueService } from '../queues/shared.service';
import { ConfigType, RATE_LIMIT_HEADERS } from './types';

@Injectable()
export class RetryHandler {
  constructor(private readonly queues: BullQueueService) {}

  async makeRequest(
    config: ConfigType,
    event_type: string,
    linkedUserId: string,
  ): Promise<PassthroughResponse> {
    try {
      const response: AxiosResponse = await axios(config);
      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
      return responseInfo;
    } catch (error) {
      if (this.isRateLimitError(error)) {
        const retryId = uuidv4();
        await this.queues
          .getFailedPassthroughRequestsQueue()
          .add(
            'retry-request',
            { retryId, config, event_type, linkedUserId },
            { jobId: retryId },
          );

        return { statusCode: 200, retryId };
      }
      throw error;
    }
  }

  private isRateLimitError(error: any): boolean {
    return error.response && error.response.status === 429;
  }

  async retryWithBackoff(config: any): Promise<AxiosResponse> {
    return backOff(
      async () => {
        try {
          const response = await axios(config);
          return response;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            const retryAfter = this.getRetryAfterDelay(error.response);
            if (retryAfter) {
              await new Promise((resolve) => setTimeout(resolve, retryAfter));
            }
            throw error; // Rethrow to trigger backoff
          }
          throw error; // Rethrow non-rate-limit errors
        }
      },
      {
        numOfAttempts: 10,
        startingDelay: 1000,
        timeMultiple: 2,
        maxDelay: 60000,
        jitter: 'full',
        retry: (e: Error, attemptNumber: number) => {
          console.log(`Retry attempt ${attemptNumber} due to: ${e.message}`);
          return true;
        },
      },
    );
  }

  private getRetryAfterDelay(response: AxiosResponse): number | null {
    for (const header of RATE_LIMIT_HEADERS) {
      const value = response.headers[header.toLowerCase()];
      if (value) {
        if (header.toLowerCase() === 'retry-after') {
          return this.parseRetryAfter(value);
        } else {
          return this.parseRateLimitReset(value);
        }
      }
    }
    return null;
  }

  private parseRetryAfter(value: string): number {
    if (!value) return null;

    if (isNaN(Number(value))) {
      // If it's not a number, treat it as a date string
      const retryDate = new Date(value);
      return isNaN(retryDate.getTime())
        ? null
        : Math.max(0, retryDate.getTime() - Date.now());
    } else {
      // If it's a number, treat it as seconds
      return parseInt(value, 10) * 1000;
    }
  }

  private parseRateLimitReset(value: string): number | null {
    if (!value) return null;

    const resetTime = parseInt(value, 10);
    return isNaN(resetTime) ? null : Math.max(0, resetTime * 1000 - Date.now());
  }

  async getRetryStatus(retryId: string): Promise<AxiosResponse | null> {
    const job = await this.queues
      .getFailedPassthroughRequestsQueue()
      .getJob(retryId);
    if (!job) {
      return null; // Job not found
    }

    if (job.finishedOn) {
      return job.returnvalue as AxiosResponse;
    } else {
      return null; // Job is still in progress
    }
  }
}

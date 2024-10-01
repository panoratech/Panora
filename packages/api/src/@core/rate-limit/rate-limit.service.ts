import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RateLimitError } from './error';

interface RateLimitPolicy {
  timeWindow: number;
  maxRequests: number;
}

@Injectable()
export class RateLimitService {
  constructor(private prisma: PrismaService) {}

  async checkRateLimit(
    connectionId: string,
    providerSlug: string,
  ): Promise<boolean> {
    const policies = await this.getRateLimitPolicies(providerSlug);

    for (const policy of policies) {
      const { timeWindow, maxRequests } = policy;
      const windowStart = new Date(Date.now() - timeWindow * 1000);

      const requestCount = await this.prisma.events.count({
        where: {
          id_connection: connectionId,
          timestamp: { gte: windowStart },
          type: { endsWith: '.pulled' },
        },
      });

      if (requestCount >= maxRequests) {
        const retryAfter = await this.getRetryAfter(connectionId);
        throw new RateLimitError('Rate limit exceeded', retryAfter);
      }
    }

    return true; // All checks passed
  }

  private async getRateLimitPolicies(
    providerSlug: string,
  ): Promise<RateLimitPolicy[]> {
    const policies: Record<string, RateLimitPolicy[]> = {
      hubspot: [
        { timeWindow: 10, maxRequests: 110 }, // 110 calls per 10 seconds
        { timeWindow: 86400, maxRequests: 250000 }, // 250k calls per day
      ],
    };
    return policies[providerSlug] || [];
  }

  async getRetryAfter(connectionId: string): Promise<number> {
    const connection = await this.prisma.connections.findUnique({
      where: { id_connection: connectionId },
    });

    if (!connection) {
      throw new Error(`Connection not found for id: ${connectionId}`);
    }

    const policies = await this.getRateLimitPolicies(connection.provider_slug);

    if (policies.length === 0) {
      return 10000; // 10 seconds default delay if no policies
    }

    let maxTimeUntilReset = 0;

    for (const policy of policies) {
      const windowStart = new Date(Date.now() - policy.timeWindow * 1000);
      const requestCount = await this.prisma.events.count({
        where: {
          id_connection: connectionId,
          timestamp: { gte: windowStart },
          type: { endsWith: '.pulled' },
        },
      });

      if (requestCount >= policy.maxRequests) {
        const latestEvent = await this.prisma.events.findFirst({
          where: {
            id_connection: connectionId,
            type: { endsWith: '.pulled' },
          },
          orderBy: { timestamp: 'desc' },
        });

        if (latestEvent) {
          const timeSinceLastRequest =
            Date.now() - latestEvent.timestamp.getTime();
          const timeUntilReset =
            policy.timeWindow * 1000 - timeSinceLastRequest;
          maxTimeUntilReset = Math.max(maxTimeUntilReset, timeUntilReset);
        }
      }
    }

    if (maxTimeUntilReset <= 0) {
      return 0;
    }

    const buffer = 1000; // 1 second buffer
    return maxTimeUntilReset + buffer;
  }

  /*async retryWithBackoff(config: any): Promise<AxiosResponse> {
    return backOff(
      async () => {
        try {
          const response = await axios(config);
          return response;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            const retryAfter = await this.getRetryAfter(config.connectionId);
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
  }*/
}

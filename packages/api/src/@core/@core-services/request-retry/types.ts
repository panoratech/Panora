import { PassthroughConfig } from '@@core/connections/@utils/types';

// Array of potential rate limit headers
export const RATE_LIMIT_HEADERS = [
  'retry-after',
  'x-rate-limit-reset',
  'x-ratelimit-reset',
  'ratelimit-reset',
];

export type ConfigType = Omit<PassthroughConfig, 'linkedUserId'>;

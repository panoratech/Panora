import { RateLimitService } from './rate-limit.service';

export function RateLimit() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const rateLimitService: RateLimitService = (this as any).rateLimitService;
      const { connection } = args[0];

      if (!rateLimitService) {
        console.error('RateLimitService not found in the class instance');
        return originalMethod.apply(this, args);
      }

      try {
        await rateLimitService.checkRateLimit(
          connection.id_connection,
          connection.provider_slug,
        );
        return await originalMethod.apply(this, args);
      } catch (error) {
        throw error;
      }
    };

    return descriptor;
  };
}

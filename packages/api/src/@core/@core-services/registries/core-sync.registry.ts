import { IBaseSync } from '@@core/utils/types/interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CoreSyncRegistry {
  private serviceMap: Map<string, IBaseSync>;
  private readonly logger = new Logger(CoreSyncRegistry.name);

  constructor() {
    this.serviceMap = new Map<string, IBaseSync>();
  }

  // Register a service with a composite key
  registerService(
    category_vertical: string,
    common_object: string,
    service: IBaseSync,
  ) {
    const compositeKey = this.createCompositeKey(
      category_vertical,
      common_object,
    );
    this.serviceMap.set(compositeKey, service);
  }

  // Retrieve a service using the composite key
  getService(category_vertical: string, common_object: string): IBaseSync {
    const compositeKey = this.createCompositeKey(
      category_vertical,
      common_object,
    );
    const service = this.serviceMap.get(compositeKey);
    if (!service) {
      this.logger.error(`Service not found for key: ${compositeKey}`);
      throw new Error(
        `Service not found for given keys: ${category_vertical}, ${common_object}`,
      );
    }
    return service;
  }

  // Utility method to create a consistent composite key from two strings
  private createCompositeKey(
    category_vertical: string,
    common_object: string,
  ): string {
    return `${category_vertical.trim().toLowerCase()}_${common_object
      .trim()
      .toLowerCase()}`;
  }
}

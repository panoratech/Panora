import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreSyncRegistry {
  private serviceMap: Map<string, any>;

  constructor() {
    this.serviceMap = new Map<string, any>();
  }

  // Register a service with a composite key
  registerService(
    category_vertical: string,
    common_object: string,
    service: any,
  ) {
    const compositeKey = this.createCompositeKey(
      category_vertical,
      common_object,
    );
    this.serviceMap.set(compositeKey, service);
  }

  // Retrieve a service using the composite key
  getService(category_vertical: string, common_object: string): any {
    const compositeKey = this.createCompositeKey(
      category_vertical,
      common_object,
    );
    const service = this.serviceMap.get(compositeKey);
    if (!service) {
      throw new Error(
        `Service not found for given keys: ${category_vertical}, ${common_object}`,
      );
    }
    return service;
  }

  // Utility method to create a consistent key from three strings
  private createCompositeKey(
    category_vertical: string,
    common_object: string,
  ): string {
    return `${category_vertical}_${common_object}`;
  }
}

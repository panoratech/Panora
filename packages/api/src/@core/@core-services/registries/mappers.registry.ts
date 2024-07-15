import { Injectable } from '@nestjs/common';

@Injectable()
export class MappersRegistry {
  private serviceMap: Map<string, any>;

  constructor() {
    this.serviceMap = new Map<string, any>();
  }

  // Register a service with a composite key
  registerService(
    category_vertical: string,
    common_object: string,
    provider_name: string,
    service: any,
  ) {
    const compositeKey = this.createCompositeKey(
      category_vertical.toLowerCase().trim(),
      common_object.toLowerCase().trim(),
      provider_name.toLowerCase().trim(),
    );
    this.serviceMap.set(compositeKey.toLowerCase().trim(), service);
  }

  // Retrieve a service using the composite key
  getService(
    category_vertical: string,
    common_object: string,
    provider_name: string,
  ): any {
    const compositeKey = this.createCompositeKey(
      category_vertical.toLowerCase().trim(),
      common_object.toLowerCase().trim(),
      provider_name.toLowerCase().trim(),
    );
    const service = this.serviceMap.get(compositeKey.toLowerCase().trim());
    if (!service) {
      throw new Error(
        `Service not found for given keys: ${category_vertical}, ${common_object}, ${provider_name}`,
      );
    }
    return service;
  }

  // Utility method to create a consistent key from three strings
  private createCompositeKey(
    category_vertical: string,
    common_object: string,
    provider_name: string,
  ): string {
    return `${category_vertical}_${common_object}_${provider_name}`;
  }
}

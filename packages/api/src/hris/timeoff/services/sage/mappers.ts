import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@hris/@lib/@utils';
import { ITimeoffMapper } from '@hris/timeoff/types';
import {
  UnifiedHrisTimeoffInput,
  UnifiedHrisTimeoffOutput,
  Status,
  RequestType,
} from '@hris/timeoff/types/model.unified';
import { SageTimeoffOutput } from './types';

@Injectable()
export class SageTimeoffMapper implements ITimeoffMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'timeoff', 'sage', this);
  }

  async desunify(
    source: UnifiedHrisTimeoffInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    // Implementation for desunify (if needed)
    return;
  }

  async unify(
    source: SageTimeoffOutput | SageTimeoffOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisTimeoffOutput | UnifiedHrisTimeoffOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleTimeoffToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((timeoff) =>
        this.mapSingleTimeoffToUnified(
          timeoff,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTimeoffToUnified(
    timeoff: SageTimeoffOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisTimeoffOutput> {
    const employee = await this.utils.getEmployeeUuidFromRemoteId(
      timeoff.employee_id.toString(),
      connectionId,
    );

    return {
      remote_id: timeoff.id.toString(),
      remote_data: timeoff,
      employee: employee,
      status: this.mapStatus(timeoff.status_code),
      employee_note: timeoff.details,
      units: 'HOURS',
      amount: timeoff.hours,
      request_type: this.inferRequestType(timeoff.details),
      start_time: new Date(timeoff.start_date),
      end_time: new Date(timeoff.end_date),
    };
  }

  private mapStatus(statusCode: string): Status {
    switch (statusCode.toLowerCase()) {
      case 'approved':
        return 'APPROVED';
      case 'declined':
        return 'DECLINED';
      case 'cancelled':
        return 'CANCELLED';
      case 'deleted':
        return 'DELETED';
      default:
        return 'REQUESTED';
    }
  }

  private inferRequestType(details: string): RequestType {
    const lowerDetails = details.toLowerCase();
    if (lowerDetails.includes('vacation') || lowerDetails.includes('holiday')) {
      return 'VACATION';
    } else if (
      lowerDetails.includes('sick') ||
      lowerDetails.includes('illness')
    ) {
      return 'SICK';
    } else if (lowerDetails.includes('jury')) {
      return 'JURY_DUTY';
    } else if (lowerDetails.includes('bereavement')) {
      return 'BEREAVEMENT';
    } else if (lowerDetails.includes('volunteer')) {
      return 'VOLUNTEER';
    } else {
      return 'PERSONAL';
    }
  }
}

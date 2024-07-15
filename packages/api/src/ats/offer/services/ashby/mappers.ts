import { AshbyOfferInput, AshbyOfferOutput } from './types';
import {
  OfferStatus,
  UnifiedOfferInput,
  UnifiedOfferOutput,
} from '@ats/offer/types/model.unified';
import { IOfferMapper } from '@ats/offer/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyOfferMapper implements IOfferMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'offer', 'ashby', this);
  }

  mapToOfferStatus(
    data:
      | 'WaitingOnApprovalStart'
      | 'WaitingOnOfferApproval'
      | 'WaitingOnApprovalDefinition'
      | 'WaitingOnCandidateResponse'
      | 'CandidateRejected'
      | 'CandidateAccepted'
      | 'OfferCancelled',
  ): OfferStatus | string {
    switch (data) {
      case 'OfferCancelled':
        return 'DEPRECATED';
      case 'CandidateAccepted':
        return 'APPROVED';
      case 'CandidateRejected':
        return 'DENIED';
      default:
        return data;
    }
  }

  async desunify(
    source: UnifiedOfferInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyOfferInput> {
    return;
  }

  async unify(
    source: AshbyOfferOutput | AshbyOfferOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOfferOutput | UnifiedOfferOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleOfferToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyOfferOutput
    return Promise.all(
      source.map((offer) =>
        this.mapSingleOfferToUnified(offer, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleOfferToUnified(
    offer: AshbyOfferOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOfferOutput> {
    return {
      remote_id: offer.id,
      remote_data: offer,
      closed_at: offer.decidedAt,
      start_date: offer.latestVersion.startDate,
      status: this.mapToOfferStatus(offer.offerStatus as any) ?? null,
      application_id:
        (await this.utils.getApplicationUuidFromRemoteId(
          offer.applicationId,
          connectionId,
        )) || null,
      remote_created_at: offer.latestVersion.createdAt,
    };
  }
}

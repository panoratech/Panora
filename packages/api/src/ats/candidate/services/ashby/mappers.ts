import { AshbyCandidateInput, AshbyCandidateOutput } from './types';
import {
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from '@ats/candidate/types/model.unified';
import { ICandidateMapper } from '@ats/candidate/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import {
  OriginalAttachmentOutput,
  OriginalTagOutput,
} from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { UnifiedAttachmentOutput } from '@ats/attachment/types/model.unified';
import { UnifiedTagOutput } from '@ats/tag/types/model.unified';

@Injectable()
export class AshbyCandidateMapper implements ICandidateMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'candidate', 'ashby', this);
  }

  async desunify(
    source: UnifiedCandidateInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyCandidateInput> {
    const data: any = {
      name: `${source.first_name || ''} ${source.last_name || ''}`,
    };
    if (source.locations) {
    }
    if (source.email_addresses) {
    }
    if (source.phone_numbers) {
      const number = source.phone_numbers[0];
      data.phoneNumber = number.phone_number;
    }

    if (source.urls) {
      for (const url of source.urls) {
        switch (url.url_type) {
          case 'LINKEDIN':
            data.linkedInUrl = url.url;
            break;
          case 'GITHUB':
            data.githubUrl = url.url;
            break;
          default:
            data.website = url.url;
            break;
        }
      }
    }

    if (source.locations) {
      const tab = source.locations.split(',');
      data.location = {
        city: tab[0] ?? null,
        region: tab[1] ?? null,
        country: tab[2] ?? null,
      };
    }
    return data;
  }

  async unify(
    source: AshbyCandidateOutput | AshbyCandidateOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCandidateOutput | UnifiedCandidateOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleCandidateToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyCandidateOutput
    return Promise.all(
      source.map((candidate) =>
        this.mapSingleCandidateToUnified(
          candidate,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleCandidateToUnified(
    candidate: AshbyCandidateOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCandidateOutput> {
    let applications;
    if (candidate.applicationIds) {
      for (const uuid of candidate.applicationIds) {
        const app = await this.utils.getApplicationUuidFromRemoteId(
          uuid,
          connectionId,
        );
        if (app) applications.push(app);
      }
    }
    let opts;
    if (candidate.fileHandles && candidate.fileHandles.length > 0) {
      const attachments = (await this.coreUnificationService.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: candidate.fileHandles,
        targetType: AtsObject.attachment,
        providerName: 'ashby',
        vertical: 'ats',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedAttachmentOutput[];
      opts = {
        attachments: attachments,
      };
    }
    if (candidate.resumeFileHandle) {
      candidate.resumeFileHandle.resume = true;
      const attachments = (await this.coreUnificationService.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: [candidate.resumeFileHandle],
        targetType: AtsObject.attachment,
        providerName: 'ashby',
        vertical: 'ats',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedAttachmentOutput[];
      opts = {
        attachments: [opts.attachments, ...attachments],
      };
    }
    if (candidate.tags && candidate.tags.length > 0) {
      const tags = (await this.coreUnificationService.unify<
        OriginalTagOutput[]
      >({
        sourceObject: candidate.tags,
        targetType: AtsObject.tag,
        providerName: 'ashby',
        vertical: 'ats',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedTagOutput[];
      opts = {
        tags: tags,
      };
    }

    if (candidate.emailAddresses) {
      let email_addresses;
      for (const email of candidate.emailAddresses) {
        email_addresses.push({
          email_address: email.value,
          email_address_type: email.type == 'Work' ? 'work' : 'primary',
        });
      }
      opts = {
        email_addresses: email_addresses,
      };
    }
    if (candidate.phoneNumbers) {
      let phone_numbers;
      for (const phone of candidate.phoneNumbers) {
        phone_numbers.push({
          phone_number: phone.value,
          phone_type: phone.type == 'Work' ? 'work' : 'primary',
        });
      }
      opts = {
        phone_numbers: phone_numbers,
      };
    }

    if (candidate.socialLinks) {
      let urls;
      for (const link of candidate.socialLinks) {
        urls.push({
          url: link.url,
          url_type: link.type,
        });
      }
      opts = {
        urls: urls,
      };
    }

    return {
      remote_id: candidate.id,
      remote_data: candidate,
      first_name: candidate.name,
      last_name: null,
      last_interaction_at: null,
      locations: candidate.primaryLocation.locationSummary || null,
      applications: applications || null,
      company: candidate.company || null,
      title: candidate.position || null,
      is_private: null,
      email_reachable: null,
      remote_created_at: candidate.createdAt,
      ...opts,
    };
  }
}

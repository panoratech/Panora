import { AshbyAttachmentInput, AshbyAttachmentOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import {
  OriginalAttachmentOutput,
  OriginalTagOutput,
} from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { UnifiedTagOutput } from '@ats/tag/types/model.unified';
import { url } from 'inspector';
import { IAttachmentMapper } from '@ats/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ats/attachment/types/model.unified';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';

@Injectable()
export class AshbyAttachmentMapper implements IAttachmentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
    private prisma: PrismaService,
    private cryptoService: EncryptionService,
  ) {
    this.mappersRegistry.registerService('ats', 'attachment', 'ashby', this);
  }

  async desunify(
    source: UnifiedAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyAttachmentInput> {
    return {
      candidateId: await this.utils.getCandidateRemoteIdFromUuid(
        source.candidate_id,
      ),
      file: source.file_name,
    };
  }

  async unify(
    source: AshbyAttachmentOutput | AshbyAttachmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAttachmentOutput | UnifiedAttachmentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleAttachmentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyAttachmentOutput
    return Promise.all(
      source.map((attachment) =>
        this.mapSingleAttachmentToUnified(
          attachment,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleAttachmentToUnified(
    attachment: AshbyAttachmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAttachmentOutput> {
    let url;
    if (attachment.handle) {
      // fetch the url given the handle
      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/file.info`,
        JSON.stringify({ fileHandle: attachment.handle }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      url = resp.data.results.url;
    }

    return {
      remote_id: attachment.id,
      remote_data: attachment,
      file_url: url || null,
      attachment_type: attachment.resume == true ? 'RESUME' : 'OTHER',
      file_name: attachment.name || null,
    };
  }
}

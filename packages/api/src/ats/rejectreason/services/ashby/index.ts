import { Injectable } from '@nestjs/common';
import { IRejectReasonService } from '@ats/rejectreason/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AshbyRejectReasonInput, AshbyRejectReasonOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalRejectReasonOutput } from '@@core/utils/types/original/original.ats';

@Injectable()
export class AshbyService implements IRejectReasonService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.rejectreason.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }
  addRejectReason(
    rejectreasonData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalRejectReasonOutput>> {
    throw new Error('Method not implemented.');
  }

  async syncRejectReasons(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<AshbyRejectReasonOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ats',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/archiveReason.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const rejectreasons: AshbyRejectReasonOutput[] = resp.data.results;
      this.logger.log(`Synced ashby rejectreasons !`);

      return {
        data: rejectreasons,
        message: 'Ashby rejectreasons retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Ashby',
        AtsObject.rejectreason,
        ActionType.GET,
      );
    }
  }
}

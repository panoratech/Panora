import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@lib/@types';
import { LeadSquaredDealInput, LeadSquaredDealOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';

@Injectable()
export class LeadSquaredService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + LeadSquaredService.name,
    );
    this.registry.registerService('leadsquared', this);
  }

  async addDeal(
    dealData: LeadSquaredDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<LeadSquaredDealOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/v2/OpportunityManagement.svc/Capture`,
        dealData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-LSQ-AccessKey': this.cryptoService.decrypt(
              connection.access_token,
            ),
            'x-LSQ-SecretKey': this.cryptoService.decrypt(
              connection.secret_token,
            ),
          },
        },
      );
      const opportunityId = resp.data.CreatedOpportunityId;
      const opportunityResp = await axios.get(
        `${connection.account_url}/v2/OpportunityManagement.svc/GetOpportunityDetails?OpportunityId=${opportunityId}`,
        {
          headers: {
            'x-LSQ-AccessKey': this.cryptoService.decrypt(
              connection.access_token,
            ),
            'x-LSQ-SecretKey': this.cryptoService.decrypt(
              connection.secret_token,
            ),
          },
        },
      );
      return {
        data: opportunityResp.data,
        message: 'Leadsquared deal created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.deal,
        ActionType.POST,
      );
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<LeadSquaredDealOutput[]>> {
    try {
      // Have to pass the leadId and opportunityType
      const { linkedUserId, leadId, opportunityType } = data;
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });
      let url = `${connection.account_url}/v2/OpportunityManagement.svc/GetOpportunitiesOfLead?leadId=${leadId}`;

      if (opportunityType) {
        url += `&opportunityType=${opportunityType}`;
      }

      const resp = await axios.post(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-LSQ-AccessKey': this.cryptoService.decrypt(
            connection.access_token,
          ),
          'x-LSQ-SecretKey': this.cryptoService.decrypt(
            connection.secret_token,
          ),
        },
      });

      return {
        data: resp.data['List'],
        message: 'Leadsquared deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.deal,
        ActionType.POST,
      );
    }
  }
}

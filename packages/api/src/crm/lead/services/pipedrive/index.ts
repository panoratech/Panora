import { Injectable } from '@nestjs/common';
import { ILeadService } from '@crm/lead/types';
import {
  CrmObject,
  PipedriveLeadInput,
  PipedriveLeadOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements ILeadService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.lead.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addLead(
    leadData: PipedriveLeadInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveLeadOutput>> {
    try {
      //TODO: check required scope  => crm.objects.leads.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/persons`,
        JSON.stringify(leadData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Pipedrive lead created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.lead,
        ActionType.POST,
      );
    }
    return;
  }

  async syncLeads(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveLeadOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.leads.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/persons`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive leads retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.lead,
        ActionType.GET,
      );
    }
  }
}

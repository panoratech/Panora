/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  CrmObject,
  FreshsalesLeadInput,
  FreshsalesLeadOutput,
} from '@crm/@utils/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ILeadService } from '@crm/lead/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class FreshsalesService implements ILeadService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.lead.toUpperCase() + ':' + FreshsalesService.name,
    );
    this.registry.registerService('freshsales', this);
  }

  async addLead(
    leadData: FreshsalesLeadInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesLeadOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const dataBody = {
        lead: leadData,
      };
      const resp = await axios.post(
        'https://domain.freshsales.io/api/leads',
        JSON.stringify(dataBody),
        {
          headers: {
            Authorization: `Token token=${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data,
        message: 'Freshsales lead created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.lead,
        ActionType.POST,
      );
    }
  }

  async syncLeads(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesLeadOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.leads.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(`https://domain.freshsales.io/api/leads`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: resp.data,
        message: 'Freshsales leads retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.lead,
        ActionType.GET,
      );
    }
  }
}

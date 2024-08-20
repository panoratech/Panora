import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse, TargetObject } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import {
  LeadSquaredContactInput,
  LeadSquaredContactOutput,
  LeadSquaredContactResponse,
} from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class LeadSquaredService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + LeadSquaredService.name,
    );
    this.registry.registerService('zoho', this);
  }

  formatDateForLeadSquared(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const currentDate = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return `${year}-${month}-${currentDate} ${hours}:${minutes}:${seconds}`;
  }

  async addContact(
    contactData: LeadSquaredContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<LeadSquaredContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });
      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/LeadManagement.svc/Lead.Create`,
        contactData,
        {
          headers,
        },
      );
      const userId = resp.data['Message']['Id'];
      const final_res = await axios.get(
        `${connection.account_url}/v2/LeadManagement.svc/Leads.GetById?id=${userId}`,
        {
          headers,
        },
      );

      return {
        data: final_res.data.data[0],
        message: 'Leadsquared contact created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.contact,
        ActionType.POST,
      );
    }
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<LeadSquaredContactOutput[]>> {
    try {
      const { linkedUserId } = data;
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });
      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };

      const fromDate = this.formatDateForLeadSquared(new Date(0));
      const toDate = this.formatDateForLeadSquared(new Date());

      const resp = await axios.get(
        `${connection.account_url}/v2/LeadManagement.svc/Leads.RecentlyModified`,
        {
          Parameter: {
            FromDate: fromDate,
            ToDate: toDate,
          },
        },
        {
          headers,
        },
      );
      const leads = resp?.data['Leads'].map(
        (lead: LeadSquaredContactResponse) => {
          const leadSquaredContact: LeadSquaredContactOutput = {};
          lead.LeadPropertyList.map(
            ({ Attribute, Value }: { Attribute: string; Value: string }) => {
              leadSquaredContact[Attribute] = Value;
            },
          );
          return leadSquaredContact;
        },
      );
      //this.logger.log('CONTACTS LEADSQUARED ' + JSON.stringify(resp.data.data));
      this.logger.log(`Synced leadsquared contacts !`);
      return {
        data: leads || [],
        message: 'Leadsquared contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }
}

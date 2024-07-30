import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject } from '@crm/@lib/@types';
import { IContactService } from '@crm/contact/types';
import { Injectable } from '@nestjs/common'
import { commonWealthboxProperties, WealthboxContactInput, WealthboxContactOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import axios from "axios"
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class WealthboxService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + WealthboxService.name,
    );
    this.registry.registerService('wealthbox', this);
  }

  async addContact(contactData: WealthboxContactInput, linkedUserId: string): Promise<ApiResponse<WealthboxContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: "wealthbox",
          vertical: "crm"
        }
      })

      const resp = await axios.post(`${connection.account_url}/v1/contacts`, JSON.stringify(contactData),
      {
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
        }
      }
    )

    return {
      data: resp.data,
      message: 'Wealthbox contact created',
      statusCode: 201,
    }
    } catch (error) {
      throw error
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<WealthboxContactOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'wealthbox',
          vertical: 'crm',
        }
      })

      const commonPropertyNames = Object.keys(commonWealthboxProperties);
      const allProperties = [...commonPropertyNames];
      const baseURL = `${connection.account_url}/objects/contacts`;

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;
      

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced wealthbox contacts !`)

      return {
        data: resp.data.contacts,
        message: "Wealthbox contacts retrived",
        statusCode: 200
      }
    } catch (error) {
      throw error
    }
  }

}
 

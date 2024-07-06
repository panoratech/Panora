import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@lib/@types';
import { ZohoStageOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class ZohoService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + ZohoService.name,
    );
    this.registry.registerService('zoho', this);
  }

  //todo: stages name are tied to deals object
  async sync(data: SyncParam): Promise<ApiResponse<ZohoStageOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      //TODO: handle fields
      const fields = 'First_Name,Last_Name,Full_Name,Email,Phone';
      const resp = await axios.get(
        `${connection.account_url}Stages?fields=${fields}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      //this.logger.log('CONTACTS ZOHO ' + JSON.stringify(resp.data.data));
      this.logger.log(`Synced zoho stages !`);
      return {
        data: resp.data.data,
        message: 'Zoho stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}

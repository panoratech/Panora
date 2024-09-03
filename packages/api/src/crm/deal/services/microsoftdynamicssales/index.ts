/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { IDealService } from '@crm/deal/types';
import { ServiceRegistry } from '../registry.service';
import { MicrosoftdynamicssalesDealInput, MicrosoftdynamicssalesDealOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class MicrosoftdynamicssalesService implements IDealService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.deal.toUpperCase() + ':' + MicrosoftdynamicssalesService.name,
        );
        this.registry.registerService('microsoftdynamicssales', this);
    }
    async addDeal(
        dealData: MicrosoftdynamicssalesDealInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesDealOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/opportunities`,
                JSON.stringify(dealData),
                {
                    headers: {
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const postDealId = respToPost.headers['location'].split("/").pop();

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postDealId}`,
                {
                    headers: {
                        accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );





            return {
                data: resp.data,
                message: 'Microsoftdynamicssales deal created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<MicrosoftdynamicssalesDealOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });
            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/opportunities`,
                {
                    headers: {
                        accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            return {
                data: resp.data.value,
                message: 'Microsoftdynamicssales deals retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

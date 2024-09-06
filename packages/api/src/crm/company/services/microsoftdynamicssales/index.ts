/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ICompanyService } from '@crm/company/types';
import { ServiceRegistry } from '../registry.service';
import { MicrosoftdynamicssalesCompanyInput, MicrosoftdynamicssalesCompanyOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';

@Injectable()
export class MicrosoftdynamicssalesService implements ICompanyService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.company.toUpperCase() + ':' + MicrosoftdynamicssalesService.name,
        );
        this.registry.registerService('microsoftdynamicssales', this);
    }
    async addCompany(
        companyData: MicrosoftdynamicssalesCompanyInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesCompanyOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/accounts`,
                JSON.stringify(companyData),
                {
                    headers: {
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const postCompanyId = respToPost.headers['location'].split("/").pop();
            // console.log(res.headers['location'].split('(')[1].split(')')[0])

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postCompanyId}`,
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
                data: resp.data,
                message: 'Microsoftdynamicssales company created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<MicrosoftdynamicssalesCompanyOutput[]>> {
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
                `${connection.account_url}/api/data/v9.2/accounts`,
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
                data: resp.data.value,
                message: 'Microsoftdynamicssales companies retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

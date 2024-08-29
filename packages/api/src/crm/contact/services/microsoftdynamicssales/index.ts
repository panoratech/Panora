import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { MicrosoftdynamicssalesContactInput, MicrosoftdynamicssalesContactOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class MicrosoftdynamicssalesService implements IContactService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.contact.toUpperCase() + ':' + MicrosoftdynamicssalesService.name,
        );
        this.registry.registerService('microsoftdynamicssales', this);
    }

    async addContact(
        contactData: MicrosoftdynamicssalesContactInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesContactOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/contacts`,
                JSON.stringify(contactData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            const postContactId = respToPost.headers['location'].split("/").pop();

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postContactId}`,
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
                message: 'microsoftdynamicssales contact created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<MicrosoftdynamicssalesContactOutput[]>> {
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
                `${connection.account_url}/api/data/v9.2/contacts`,
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
                message: 'Microsoftdynamicssales contacts retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

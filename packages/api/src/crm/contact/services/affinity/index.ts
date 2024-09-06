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
import { AffinityContactInput, AffinityContactOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class AffinityService implements IContactService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.contact.toUpperCase() + ':' + AffinityService.name,
        );
        this.registry.registerService('affinity', this);
    }

    async addContact(
        contactData: AffinityContactInput,
        linkedUserId: string,
    ): Promise<ApiResponse<AffinityContactOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });

            const resp = await axios.post(
                `${connection.account_url}/persons`,
                JSON.stringify({
                    data: contactData,
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            return {
                data: resp.data,
                message: 'affinity contact created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<AffinityContactOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });

            const resp = await axios.get(
                `${connection.account_url}/persons`,
                {
                    headers: {
                        accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            return {
                data: resp.data,
                message: 'Affinity contacts retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

import { Injectable } from '@nestjs/common';
import { EncryptionService } from "@@core/encryption/encryption.service";
import { LoggerService } from "@@core/logger/logger.service";
import { PrismaService } from "@@core/prisma/prisma.service";
import { ServiceRegistry } from "../registry.service";
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import { IContactService } from '@ticketing/contact/types';
import axios from 'axios';
import { WrikeContactOutput } from './types';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';

@Injectable()
export class WrikeService implements IContactService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.contact.toUpperCase() + ':' + WrikeService.name,
        );
        this.registry.registerService('wrike', this);
    }


    async syncContacts(
        linkedUserId: string,
        remote_account_id: string,
    ): Promise<ApiResponse<WrikeContactOutput[]>> {
        try {
            if (!remote_account_id)
                throw new ReferenceError('remote account id not found');

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'wrike',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(
                `${connection.account_url}/accounts/${remote_account_id}/contacts`,
                {
                    headers: {
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            this.logger.log(`Synced wrike contacts !`);

            return {
                data: resp.data._results,
                message: 'Wrike contacts retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
            // handle3rdPartyServiceError(
            //   error,
            //   this.logger,
            //   'wrike',
            //   TicketingObject.contact,
            //   ActionType.GET,
            // );
        }
    }
}

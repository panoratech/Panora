import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IAccountService } from '@ticketing/account/types';
import { ServiceRegistry } from '../registry.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import axios from 'axios';
import { ApiResponse } from '@@core/utils/types';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { WrikeAccountOutput } from './types';


@Injectable()
export class WrikeService implements IAccountService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.account.toUpperCase() + ':' + WrikeService.name,
        );
        this.registry.registerService('wrike', this);
    }

    async syncAccounts(
        linkedUserId: string,
        remote_account_id?: string,
    ): Promise<ApiResponse<WrikeAccountOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'wrike',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(`${connection.account_url}/accounts`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced wrike accounts !`);

            return {
                data: resp.data._results,
                message: 'Wrike accounts retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handle3rdPartyServiceError(
                error,
                this.logger,
                'wrike',
                TicketingObject.account,
                ActionType.GET,
            );
        }
    }
}
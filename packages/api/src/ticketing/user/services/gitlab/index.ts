import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { GitlabUserOutput } from './types';

@Injectable()
export class GitlabService implements IUserService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.user.toUpperCase() + ':' + GitlabService.name,
        );
        this.registry.registerService('gitlab', this);
    }

    async syncUsers(
        linkedUserId: string,
    ): Promise<ApiResponse<GitlabUserOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'gitlab',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(`${connection.account_url}/users`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced gitlab users !`);

            return {
                data: resp.data._results,
                message: 'gitlab users retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handleServiceError(
                error,
                this.logger,
                'Gitlab',
                TicketingObject.user,
                ActionType.GET,
            );
        }
    }
}

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ICollectionService } from '@ticketing/collection/types';
import { GitlabCollectionInput, GitlabCollectionOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';

@Injectable()
export class GitlabService implements ICollectionService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.collection.toUpperCase() + ':' + GitlabService.name,
        );
        this.registry.registerService('gitlab', this);
    }

    async syncCollections(
        linkedUserId: string,
    ): Promise<ApiResponse<GitlabCollectionOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'gitlab',
                    vertical: 'ticketing',
                },
            });


            const resp = await axios.get(`${connection.account_url}/projects`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });

            this.logger.log(`Synced gitlab collections !`);

            // console.log("In index of gitlab", JSON.stringify(resp.data))


            return {
                data: resp.data,
                message: 'Gitlab collections retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handleServiceError(
                error,
                this.logger,
                'Gitlab',
                TicketingObject.collection,
                ActionType.GET,
            );
        }
    }


}

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ITagService } from '@ticketing/tag/types';
import { GitlabTagOutput } from './types';

@Injectable()
export class GitlabService implements ITagService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.tag.toUpperCase() + ':' + GitlabService.name,
        );
        this.registry.registerService('gitlab', this);
    }


    // Here id_ticket ==> id_project
    async syncTags(
        linkedUserId: string,
        id_project: string,
    ): Promise<ApiResponse<GitlabTagOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'gitlab',
                    vertical: 'ticketing',
                },
            });


            const resp = await axios.get(`${connection.account_url}/projects/${id_project}/repository/tags`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced gitlab tags !`);



            return {
                data: resp.data,
                message: 'Gitlab tags retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handleServiceError(
                error,
                this.logger,
                'Gitlab',
                TicketingObject.tag,
                ActionType.GET,
            );
        }
    }
}

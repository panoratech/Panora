import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { GithubTicketInput, GithubTicketOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { GithubCollectionOutput } from '@ticketing/collection/services/github/types';

@Injectable()
export class GithubService implements ITicketService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.ticket.toUpperCase() + ':' + GithubService.name,
        );
        this.registry.registerService('github', this);
    }
    async addTicket(
        ticketData: GithubTicketInput,
        linkedUserId: string,
    ): Promise<ApiResponse<GithubTicketOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });
            const { comment, collection_id, ...ticketD } = ticketData;
            const DATA = {
                ...ticketD,
            };

            const remote_data = await this.prisma.remote_data.findFirst({
                where: {
                    ressource_owner_id: collection_id,
                },
            });

            // let res: any = []

            const githubCollectionOutput = JSON.parse(remote_data.data) as GithubCollectionOutput;

            const resp = await axios.post(
                `${connection.account_url}/repos/${githubCollectionOutput.owner.login}/${githubCollectionOutput.name}/issues`,
                JSON.stringify(DATA),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            //insert comment
            if (comment) {
                const resp_ = await axios.post(
                    `${connection.account_url}/repos/${githubCollectionOutput.owner.login}/${githubCollectionOutput.name}/issues/${resp.data.number}/comments`,
                    JSON.stringify(comment),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.cryptoService.decrypt(
                                connection.access_token,
                            )}`,
                        },
                    },
                );
            }
            return {
                data: resp.data,
                message: 'Github ticket created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }
    async sync(data: SyncParam): Promise<ApiResponse<GithubTicketOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(
                `${connection.account_url}/issues?filter=all&state=open`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            this.logger.log(`Synced github tickets !`);

            return {
                data: resp.data,
                message: 'Github tickets retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

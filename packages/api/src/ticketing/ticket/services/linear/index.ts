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
import { LinearTicketInput, LinearTicketOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { LinearCollectionOutput } from '@ticketing/collection/services/linear/types';

@Injectable()
export class LinearService implements ITicketService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.ticket.toUpperCase() + ':' + LinearService.name,
        );
        this.registry.registerService('linear', this);
    }
    async addTicket(
        ticketData: LinearTicketInput,
        linkedUserId: string,
    ): Promise<ApiResponse<LinearTicketOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'linear',
                    vertical: 'ticketing',
                },
            });

            if (!ticketData.team.id) {
                throw new ReferenceError(
                    `team_id is required field and cant be empty while creating a ticket.`,
                );
            }

            const createIssueMutation = {
                "query": `mutation ($issueCreateInput: IssueCreateInput!) { issueCreate(input: $issueCreateInput) { issue { id title description dueDate parent{ id } state { name } project{ id } labels { nodes { id } } completedAt priorityLabel assignee { id } comments { nodes { id } } } }}`,
                "variables": {
                    "issueCreateInput": {
                        "title": ticketData.title,
                        "description": ticketData.description,
                        "assigneeId": ticketData.assignee?.id,
                        "parentId": ticketData.parent?.id,
                        "labelIds": ticketData.labels?.nodes,
                        "projectId": ticketData.project?.id,
                        "sourceCommentId": ticketData.comments?.nodes,
                        "dueDate": ticketData.dueDate,
                        "teamId": ticketData.team.id
                    }
                }
            };

            let resp = await axios.post(
                `${connection.account_url}`,
                createIssueMutation, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Created linear ticket !`);

            return {
                data: resp.data.data.issueCreate.issue,
                message: 'Linear ticket created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }
    async sync(data: SyncParam): Promise<ApiResponse<LinearTicketOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'linear',
                    vertical: 'ticketing',
                },
            });

            const issueQuery = {
                "query": "query { issues { nodes { id title description dueDate parent{ id } state { name } project{ id } labels { nodes { id } } completedAt priorityLabel assignee { id } comments { nodes { id } } } }}"
            };

            let resp = await axios.post(
                `${connection.account_url}`,
                issueQuery, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced linear tickets !`);

            return {
                data: resp.data.data.issues.nodes,
                message: 'Linear tickets retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

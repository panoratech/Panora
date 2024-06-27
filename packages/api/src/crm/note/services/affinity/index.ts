import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@lib/@types';
import { AffinityNoteInput, AffinityNoteOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class AffinityService implements INoteService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.note.toUpperCase() + ':' + AffinityService.name,
        );
        this.registry.registerService('affinity', this);
    }
    async addNote(
        noteData: AffinityNoteInput,
        linkedUserId: string,
    ): Promise<ApiResponse<AffinityNoteOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });
            const resp = await axios.post(
                `${connection.account_url}/notes`,
                JSON.stringify(noteData),
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
                data: resp?.data,
                message: 'Affinity note created',
                statusCode: 201,
            };
        } catch (error) {
            handle3rdPartyServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.note,
                ActionType.POST,
            );
        }
    }

    async syncNotes(
        linkedUserId: string,
        custom_properties?: string[],
    ): Promise<ApiResponse<AffinityNoteOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });

            const resp = await axios.get(
                `${connection.account_url}/notes`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });
            this.logger.log(`Synced affinity notes !`);
            return {
                data: resp?.data,
                message: 'Affinity notes retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handle3rdPartyServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.note,
                ActionType.GET,
            );
        }
    }
}

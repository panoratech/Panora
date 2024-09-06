import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { INoteService } from '@crm/note/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AffinityNoteInput, AffinityNoteOutput } from './types';

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
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<AffinityNoteOutput[]>> {
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
            throw error;
        }
    }
}

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
import { MicrosoftdynamicssalesNoteInput, MicrosoftdynamicssalesNoteOutput } from './types';

@Injectable()
export class MicrosoftdynamicssalesService implements INoteService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.note.toUpperCase() + ':' + MicrosoftdynamicssalesService.name,
        );
        this.registry.registerService('microsoftdynamicssales', this);
    }

    async addNote(
        noteData: MicrosoftdynamicssalesNoteInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesNoteOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });
            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/annotations`,
                JSON.stringify(noteData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            const postNoteId = respToPost.headers['location'].split("/").pop();

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postNoteId}`
                , {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });



            return {
                data: resp?.data,
                message: 'Microsoftdynamicssales note created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<MicrosoftdynamicssalesNoteOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const baseURL = `${connection.account_url}/api/data/v9.2/annotations`;

            const resp = await axios.get(baseURL, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced microsoftdynamicssales notes !`);
            return {
                data: resp?.data?.value,
                message: 'Microsoftdynamicssales notes retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

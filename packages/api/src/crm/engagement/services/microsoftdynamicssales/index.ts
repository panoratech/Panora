import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IEngagementService } from '@crm/engagement/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
    MicrosoftdynamicssalesEngagementAppointmentInput,
    MicrosoftdynamicssalesEngagementAppointmentOutput,
    MicrosoftdynamicssalesEngagementCallInput,
    MicrosoftdynamicssalesEngagementCallOutput,
    MicrosoftdynamicssalesEngagementEmailInput,
    MicrosoftdynamicssalesEngagementEmailOutput,
    MicrosoftdynamicssalesEngagementInput,
    MicrosoftdynamicssalesEngagementOutput
} from './types';

@Injectable()
export class MicrosoftdynamicssalesService implements IEngagementService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.engagement.toUpperCase() + ':' + MicrosoftdynamicssalesService.name,
        );
        this.registry.registerService('microsoftdynamicssales', this);
    }
    async addEngagement(
        engagementData: MicrosoftdynamicssalesEngagementInput,
        linkedUserId: string,
        engagement_type: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesEngagementOutput>> {
        try {
            switch (engagement_type) {
                case 'CALL':
                    return this.addCall(
                        engagementData as MicrosoftdynamicssalesEngagementCallInput,
                        linkedUserId,
                    );
                case 'MEETING':
                    return this.addMeeting(
                        engagementData as MicrosoftdynamicssalesEngagementAppointmentInput,
                        linkedUserId,
                    );
                case 'EMAIL':
                    return this.addEmail(
                        engagementData as MicrosoftdynamicssalesEngagementEmailInput,
                        linkedUserId,
                    );
                default:
                    break;
            }
        } catch (error) {
            throw error;
        }
    }

    private async addCall(
        engagementData: MicrosoftdynamicssalesEngagementCallInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesEngagementCallOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/phonecalls`,
                JSON.stringify(engagementData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            const postCallId = respToPost.headers['location'].split("/").pop();

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postCallId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });

            return {
                data: resp.data,
                message: 'Microsoftdynamicssales call created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    private async addMeeting(
        engagementData: MicrosoftdynamicssalesEngagementAppointmentInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesEngagementAppointmentOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/appointments`,
                JSON.stringify(engagementData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            const postAppointmentId = respToPost.headers['location'].split("/").pop();

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postAppointmentId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });


            return {
                data: resp.data,
                message: 'Microsoftdynamicssales meeting created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    private async addEmail(
        engagementData: MicrosoftdynamicssalesEngagementEmailInput,
        linkedUserId: string,
    ): Promise<ApiResponse<MicrosoftdynamicssalesEngagementEmailOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            const respToPost = await axios.post(
                `${connection.account_url}/api/data/v9.2/emails`,
                JSON.stringify(engagementData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            const postEmailId = respToPost.headers['location'].split("/").pop();

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/${postEmailId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });


            return {
                data: resp.data,
                message: 'Microsoftdynamicssales email created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<MicrosoftdynamicssalesEngagementOutput[]>> {
        try {
            const { linkedUserId, custom_properties, engagement_type } = data;

            switch (engagement_type as string) {
                case 'CALL':
                    return this.syncCalls(linkedUserId, custom_properties);
                case 'MEETING':
                    return this.syncMeetings(linkedUserId, custom_properties);
                case 'EMAIL':
                    return this.syncEmails(linkedUserId, custom_properties);
                default:
                    break;
            }
        } catch (error) {
            throw error;
        }
    }

    private async syncCalls(linkedUserId: string, custom_properties?: string[]) {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            //   const commonPropertyNames = Object.keys(commonCallMicrosoftdynamicssaleProperties);
            //   const allProperties = [...commonPropertyNames, ...custom_properties];
            //   const baseURL = 'https://api.hubapi.com/crm/v3/objects/calls';

            //   const queryString = allProperties
            //     .map((prop) => `properties=${encodeURIComponent(prop)}`)
            //     .join('&');

            //   const url = `${baseURL}?${queryString}`;

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/phonecalls`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });
            this.logger.log(`Synced microsoftdynamicssales engagements calls !`);

            return {
                data: resp.data.value,
                message: 'Microsoftdynamicssales engagements calls retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }

    private async syncMeetings(
        linkedUserId: string,
        custom_properties?: string[],
    ) {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            //   const commonPropertyNames = Object.keys(commonMeetingMicrosoftdynamicssaleProperties);
            //   const allProperties = [...commonPropertyNames, ...custom_properties];
            //   const baseURL = 'https://api.hubapi.com/crm/v3/objects/meetings';

            //   const queryString = allProperties
            //     .map((prop) => `properties=${encodeURIComponent(prop)}`)
            //     .join('&');

            //   const url = `${baseURL}?${queryString}`;

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/appointments`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });
            this.logger.log(`Synced microsoftdynamicssales engagements meetings !`);

            return {
                data: resp.data.value,
                message: 'Microsoftdynamicssales engagements meetings retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }

    private async syncEmails(linkedUserId: string, custom_properties?: string[]) {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            //   const commonPropertyNames = Object.keys(commonEmailMicrosoftdynamicssaleProperties);
            //   const allProperties = [...commonPropertyNames, ...custom_properties];
            //   const baseURL = 'https://api.hubapi.com/crm/v3/objects/emails';

            //   const queryString = allProperties
            //     .map((prop) => `properties=${encodeURIComponent(prop)}`)
            //     .join('&');

            //   const url = `${baseURL}?${queryString}`;

            const resp = await axios.get(
                `${connection.account_url}/api/data/v9.2/emails`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });
            this.logger.log(`Synced microsoftdynamicssales engagements emails !`);

            return {
                data: resp.data.value,
                message: 'Microsoftdynamicssales engagements emails retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}

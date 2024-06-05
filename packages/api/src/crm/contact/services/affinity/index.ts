import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AffinityContactInput, AffinityContactOutput } from './types';

@Injectable()
export class AffinityService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private httpService: HttpService,
  ) {
    this.logger.setContext(
      'CRM:Contact:' + AffinityService.name,
    );
    this.registry.registerService('affinity', this);
  }

  async addContact(
    contactData: AffinityContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AffinityContactOutput>> {
    try {
      const accessToken = await this.getAccessToken(linkedUserId);
      const response = await lastValueFrom(
        this.httpService.post('https://api.affinity.co/contacts', contactData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error adding contact to Affinity', error);
      return {
        success: false,
        message: 'Failed to add contact to Affinity',
      };
    }
  }

  async syncContacts(
    linkedUserId: string,
  ): Promise<ApiResponse<AffinityContactOutput[]>> {
    try {
      const accessToken = await this.getAccessToken(linkedUserId);
      const response = await lastValueFrom(
        this.httpService.get('https://api.affinity.co/contacts', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error syncing contacts from Affinity', error);
      return {
        success: false,
        message: 'Failed to sync contacts from Affinity',
      };
    }
  }

  private async getAccessToken(linkedUserId: string): Promise<string> {
    const connection = await this.prisma.connection.findUnique({
      where: {
        linkedUserId,
        provider: 'affinity',
      },
    });

    if (!connection) {
      throw new Error('No Affinity connection found for user');
    }

    if (new Date(connection.expiresAt) < new Date()) {
      const refreshResponse = await lastValueFrom(
        this.httpService.post('https://api.affinity.co/oauth/token', {
          grant_type: 'refresh_token',
          refresh_token: connection.refreshToken,
          client_id: this.env.get('AFFINITY_CLIENT_ID'),
          client_secret: this.env.get('AFFINITY_CLIENT_SECRET'),
        })
      );

      const { access_token, refresh_token, expires_in } = refreshResponse.data;

      await this.prisma.connection.update({
        where: { id: connection.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      return access_token;
    }

    return connection.accessToken;
  }
}
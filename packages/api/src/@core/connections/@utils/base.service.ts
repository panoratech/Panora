import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import {
  PassthroughConfig,
  PassthroughInput,
} from '@@core/connections/@utils/types';
import {
  JsonData,
  MultipartData,
} from '@@core/passthrough/dto/passthrough.dto';
import { Injectable } from '@nestjs/common';
import { AuthStrategy, CONNECTORS_METADATA } from '@panora/shared';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export abstract class BaseConnectionService {
  constructor(
    protected prisma: PrismaService,
    protected cryptoService: EncryptionService,
  ) {}

  async constructPassthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughConfig> {
    const { method, path, headers, req_type, overrideBaseUrl, data } = input;
    const connection = await this.prisma.connections.findUnique({
      where: {
        id_connection: connectionId,
      },
    });

    //TODO: {{PARAMS}} to construct the right url (would be done in the 3rd party service class)

    const base = overrideBaseUrl || `${connection.account_url}`;
    const url = `${base}/${path}`;

    const auth =
      CONNECTORS_METADATA[connection.vertical.toLowerCase()][
        connection.provider_slug.toLowerCase()
      ].authStrategy;

    // as most providers share this common auth structure we input and if it needs change it will be updated in the 3rd party class service
    let HEADERS: Record<string, any> = {
      ...headers,
    };
    if (auth.strategy == AuthStrategy.oauth2) {
      HEADERS = {
        ...HEADERS,
        Authorization: `Bearer ${this.cryptoService.decrypt(
          connection.access_token,
        )}`,
      };
    }
    if (auth.strategy == AuthStrategy.api_key) {
      HEADERS = {
        ...HEADERS,
        'api-key': this.cryptoService.decrypt(connection.access_token),
      };
    }

    let DATA: FormData | JsonData;
    switch (req_type) {
      case 'JSON':
        HEADERS = {
          ...HEADERS,
          'Content-Type': 'application/json',
        };
        DATA = data as JsonData;
        break;
      case 'MULTIPART':
        HEADERS = {
          ...HEADERS,
          'Content-Type': 'multipart/form-data',
        };
        const formData = new FormData();
        for (const obj of data as MultipartData[]) {
          formData.append(
            obj.name,
            obj.file_name ? fs.createReadStream(obj.file_name) : obj.data,
          );
        }
        DATA = formData;
        break;
    }
    return {
      url,
      method,
      headers: HEADERS,
      data: DATA,
      linkedUserId: connection.id_linked_user,
    };
  }
}

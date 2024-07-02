import { EncryptionService } from "@@core/encryption/encryption.service";
import { LoggerService } from "@@core/logger/logger.service";
import { PrismaService } from "@@core/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { ICollectionService } from "@ticketing/collection/types";
import { ServiceRegistry } from "../registry.service";
import { TicketingObject } from "@ticketing/@lib/@types";
import { ApiResponse } from "@@core/utils/types";
import axios from "axios";
import { ActionType, handle3rdPartyServiceError } from "@@core/utils/errors";
import { WrikeCollectionOutput } from "./types";

@Injectable()
export class WrikeService implements ICollectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.collection.toUpperCase() + ':' + WrikeService.name,
    );
    this.registry.registerService('wrike', this);
  }

  async syncCollections(
    linkedUserId: string,
  ): Promise<ApiResponse<WrikeCollectionOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'wrike',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/project/search`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced wrike collections !`);

      return {
        data: resp.data,
        message: 'Wrike collections retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'wrike',
        TicketingObject.collection,
        ActionType.GET,
      );
    }
  }
}
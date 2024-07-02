import { EncryptionService } from "@@core/encryption/encryption.service";
import { LoggerService } from "@@core/logger/logger.service";
import { PrismaService } from "@@core/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { ITeamService } from "@ticketing/team/types";
import { ServiceRegistry } from "../registry.service";
import { TicketingObject } from "@ticketing/@lib/@types";
import { ApiResponse } from "@@core/utils/types";
import axios from "axios";
import { ActionType, handle3rdPartyServiceError } from "@@core/utils/errors";
import { WrikeTeamOutput } from "./types";

@Injectable()
export class WrikeService implements ITeamService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.team.toUpperCase() + ':' + WrikeService.name,
    );
    this.registry.registerService('wrike', this);
  }

  async syncTeams(
    linkedUserId: string,
  ): Promise<ApiResponse<WrikeTeamOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'wrike',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/teams`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced wrike teams !`);

      return {
        data: resp.data._results,
        message: 'Wrike teams retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'wrike',
        TicketingObject.team,
        ActionType.GET,
      );
    }
  }
}
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry as UserServiceRegistry } from '@ticketing/user/services/registry.service';
import { ServiceRegistry as TicketServiceRegistry } from '@ticketing/ticket/services/registry.service';

type SyncFunction<T> = (
  linkedUserId: string,
  custom_properties?: string[],
) => Promise<ApiResponse<T[]>>;

abstract class CommonServiceHelper<T> {
  protected constructor(
    protected prisma: PrismaService,
    protected logger: LoggerService,
    protected cryptoService: EncryptionService,
    protected registry: UserServiceRegistry | TicketServiceRegistry,
    protected ticketingValue: TicketingObject,
    protected providerName: string,
    protected providerSlug: string,
  ) {
    this.logger.setContext(
      ticketingValue.toUpperCase() + ':' + this.constructor.name,
    );
  }

  protected abstract constructApiEndpoint(custom_properties?: string[]): string;

  protected async defaultSyncUsersImplementation(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<T[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: this.providerSlug,
        },
      });

      const url = this.constructApiEndpoint(custom_properties);

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(
        `Synced ${this.providerName.toLowerCase()} ${this.ticketingValue} !`,
      );

      return {
        data: this.mapResponse(resp.data),
        message: `${this.providerName} ${this.ticketingValue} retrieved`,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        this.providerName,
        TicketingObject.user,
        ActionType.GET,
      );
    }
  }

  protected abstract mapResponse(data: any): T[];
}

export abstract class CommonTicketService<T, U> extends CommonServiceHelper<T> {
  syncTickets: SyncFunction<T>;

  constructor(
    protected prisma: PrismaService,
    protected logger: LoggerService,
    protected cryptoService: EncryptionService,
    protected registry: TicketServiceRegistry,
    protected providerName: string,
    protected providerSlug: string,
  ) {
    super(
      prisma,
      logger,
      cryptoService,
      registry,
      TicketingObject.ticket,
      providerName,
      providerSlug,
    );

    this.syncTickets = this.defaultSyncUsersImplementation.bind(this);

    this.registry.registerService(this.providerSlug, this);
  }

  abstract addTicket(
    ticketData: U,
    linkedUserId: string,
  ): Promise<ApiResponse<T>>;
}

export abstract class CommonUserService<T> extends CommonServiceHelper<T> {
  syncUsers: SyncFunction<T>;

  constructor(
    protected prisma: PrismaService,
    protected logger: LoggerService,
    protected cryptoService: EncryptionService,
    protected registry: UserServiceRegistry,
    protected providerName: string,
    protected providerSlug: string,
  ) {
    super(
      prisma,
      logger,
      cryptoService,
      registry,
      TicketingObject.user,
      providerName,
      providerSlug,
    );

    this.syncUsers = this.defaultSyncUsersImplementation.bind(this);

    this.registry.registerService(this.providerSlug, this);
  }
}

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse, Pagination } from '@@core/utils/types';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { GitlabTicketInput, GitlabTicketOutput } from './types';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GitlabService implements ITicketService {
  private readonly utils: Utils;
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
    this.utils = new Utils();
  }
  async addTicket(
    ticketData: GitlabTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<GitlabTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
          vertical: 'ticketing',
        },
      });
      this.logger.log(
        `Sending request to GitLab API: ${connection.account_url}/projects/${ticketData.id}/issues`,
      );

      const resp = await this.utils.sendRequestWithRetry({
        url: `${connection.account_url}/projects/${ticketData.id}/issues`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
        data: ticketData,
      });
      return {
        data: resp.data,
        message: 'Gitlab ticket created',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error(`Error in addTicket: ${error.message}`, error.stack);
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }
  async syncTickets(
    linkedUserId: string,
    _?: string[],
    pageMeta?: Pagination,
  ): Promise<ApiResponse<GitlabTicketOutput[]>> {
    try {
      let baseUrl: string = pageMeta?.baseUrl ?? '';
      const connection =
        pageMeta?.connection ||
        (await this.prisma.connections.findFirst({
          where: {
            id_linked_user: linkedUserId,
            provider_slug: 'gitlab',
            vertical: 'ticketing',
          },
        }));
      if (!baseUrl) {
        baseUrl = `${connection.account_url}/issues`;
        pageMeta = {
          ...pageMeta,
          baseUrl,
          queryParams: { order_by: 'updated_at' },
        };
      }
      const apiUrl = this.utils.getPaginateUrl(baseUrl, 'gitlab', pageMeta);
      this.logger.log(`Sending request to GitLab API: ${apiUrl}`);
      const resp = await this.utils.sendRequestWithRetry({
        url: apiUrl,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Syning gitlab tickets !`, resp?.data);
      const links = this.utils.extractPaginationDetailsFromResponse(
        resp,
        'gitlab',
      );
      const newPageMeta = { ...pageMeta, isFirst: false, connection, links };
      newPageMeta.isLastPage = this.utils.getLastPageStatus(
        newPageMeta,
        'gitlab',
      );
      this.logger.log(
        `fetched the gitlab tickets of size ${resp?.data?.length}. ${
          newPageMeta?.isLastPage
            ? 'This is this last page.'
            : 'Syncing into system and waiting for next page results....'
        }}`,
      );
      return {
        data: resp?.data,
        message: 'Gitlab tickets retrieved',
        statusCode: 200,
        pageMeta: newPageMeta,
      };
    } catch (error) {
      this.logger.error(`Error in syncTicket: ${error.message}`, error.stack);
      handleServiceError(
        error,
        this.logger,
        'Gitlab',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}

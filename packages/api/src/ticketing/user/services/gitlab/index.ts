import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { GitlabUserOutput } from './types';
import { Pagination, Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GitlabService implements IUserService {
  private readonly utils: Utils;
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
    this.utils = new Utils();
  }

  async syncUsers(
    linkedUserId: string,
    _: string[] | null,
    pageMeta?: Pagination,
  ): Promise<ApiResponse<GitlabUserOutput[]>> {
    try {
      let baseUrl = pageMeta?.baseUrl;
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
        baseUrl = `${connection.account_url}/users`;
        pageMeta = {
          ...pageMeta,
          baseUrl,
          queryParams: { order_by: 'updated_at' },
        };
      }
      const apiUrl = this.utils.getPaginateUrl(baseUrl, 'gitlab', pageMeta);
      // apiUrl += `&without_project_bots=true`;
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
      this.logger.log(`Synced gitlab users !`);
      const links = this.utils.extractPaginationDetailsFromResponse(
        resp,
        'gitlab',
      );
      const newPageMeta = { ...pageMeta, isFirst: false, connection, links };
      newPageMeta.isLastPage = this.utils.getLastPageStatus(
        newPageMeta,
        'gitlab',
      );
      return {
        data: resp.data,
        message: 'Gitlab users retrieved',
        statusCode: 200,
        pageMeta: newPageMeta,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'gitlab',
        TicketingObject.user,
        ActionType.GET,
      );
    }
  }
}

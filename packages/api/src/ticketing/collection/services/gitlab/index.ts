import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ICollectionService } from '@ticketing/collection/types';
import { GitlabCollectionOutput } from './types';
import { Pagination, Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GitlabService implements ICollectionService {
  private readonly utils: Utils;
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.collection.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
    this.utils = new Utils();
  }

  async syncCollections(
    linkedUserId: string,
    _?: string[] | null,
    pageMeta?: Pagination,
  ): Promise<ApiResponse<GitlabCollectionOutput[]>> {
    try {
      pageMeta = { isFirstPage: true, ...(pageMeta || {}) } as Pagination;
      if (pageMeta.isLastPage) {
        return {
          data: [],
          message: 'Gitlab collections Cursor ended. no more records....',
          statusCode: 200,
          pageMeta: {
            ...pageMeta,
            isFirstPage: false,
          },
        };
      }
      let baseUrl = pageMeta.baseURl;
      const connection =
        pageMeta.connection ||
        (await this.prisma.connections.findFirst({
          where: {
            id_linked_user: linkedUserId,
            provider_slug: 'gitlab',
            vertical: 'ticketing',
          },
        }));
      if (!baseUrl) {
        const currentUser = (
          await this.utils.sendRequestWithRetry({
            url: `${connection.account_url}/user`,
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          })
        ).data;
        baseUrl = `${connection.account_url}/users/${currentUser?.id}/projects`;
        pageMeta = {
          ...pageMeta,
          baseUrl,
          queryParams: { order_by: 'id' },
        };
      }
      const apiUrl = this.utils.getPaginateUrl(baseUrl, 'gitlab', pageMeta);
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

      this.logger.log(`Syncing gitlab collections !`);
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
        `fetched the gitlab collections of size ${resp?.data?.length}. ${
          newPageMeta?.isLastPage
            ? `This is this last page.`
            : `Syncing into system and waiting for next page results....}`
        }}`,
      );
      return {
        data: resp.data,
        message: 'Gitlab collections retrieved',
        statusCode: 200,
        pageMeta: newPageMeta,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'gitlab',
        TicketingObject.collection,
        ActionType.GET,
      );
    }
  }
}

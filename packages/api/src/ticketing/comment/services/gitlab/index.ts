import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { GitlabCommentInput, GitlabCommentOutput } from './types';
import { ServiceRegistry } from '../registry.service';
import { Pagination, Utils } from '@ticketing/@lib/@utils';
@Injectable()
export class GitlabService implements ICommentService {
  private readonly utils: Utils;
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
    this.utils = new Utils();
  }

  async addComment(
    commentData: GitlabCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<GitlabCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
          vertical: 'ticketing',
        },
      });
      // Send request without attachments

      const ticket = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: remoteIdTicket,
          remote_platform: 'gitlab',
        },
        select: {
          id_tcg_user: true,
        },
      });

      const remoteTicketData = await this.prisma.remote_data.findFirst({
        where: {
          ressource_owner_id: ticket.id_tcg_user,
        },
      });
      const remotedata = JSON.parse(remoteTicketData.data);
      const resp = await this.utils.sendRequestWithRetry({
        url: `${connection.account_url}/${remotedata.project_id}/issues/${remotedata.iid}/notes`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
          data: commentData,
        },
      });
      return {
        data: resp.data,
        message: 'Gitlab comment created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Gitlab',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
    _?: string[],
    pageMeta?: Pagination,
  ): Promise<ApiResponse<GitlabCommentOutput[]>> {
    try {
      pageMeta = pageMeta || ({ isFirstPage: true } as Pagination);
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
        //retrieve ticket remote id so we can retrieve the comments in the original software
        const ticket = await this.prisma.tcg_tickets.findUnique({
          where: {
            id_tcg_ticket: id_ticket,
          },
          select: {
            remote_id: true,
            // project_remote_id: true,
          },
        });

        const remoteTicketData = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: id_ticket,
          },
        });
        const remotedata = JSON.parse(remoteTicketData.data);
        baseUrl =
          pageMeta?.baseUrl ||
          `${connection.account_url}/projects/${remotedata.project_id}/issues/${remotedata.iid}/notes`;
        pageMeta = {
          ...pageMeta,
          baseUrl,
        };
      }
      const apiurl = this.utils.getPaginateUrl(baseUrl, 'gitlab', pageMeta);
      const resp = await this.utils.sendRequestWithRetry({
        url: apiurl,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced gitlab comments !`);
      const links = this.utils.extractPaginationDetailsFromResponse(
        resp,
        'gitlab',
      );
      const comments = resp.data?.filter((comment) => !comment.system);
      const newPageMeta = { ...pageMeta, isFirst: false, connection, links };
      newPageMeta.isLastPage = this.utils.getLastPageStatus(
        newPageMeta,
        'gitlab',
      );
      return {
        data: comments,
        message: 'Gitlab comments retrieved',
        statusCode: 200,
        pageMeta: newPageMeta,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'gitlab',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}

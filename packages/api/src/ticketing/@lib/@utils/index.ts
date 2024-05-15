import { ApiResponse, Pagination } from '@@core/utils/types';
import { TicketingObjectOutput } from '@@core/utils/types/original/original.ticketing';
import { PrismaClient } from '@prisma/client';
import { UnifiedTicketInput } from '@ticketing/ticket/types/model.unified';
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';

export class Utils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    /*this.cryptoService = new EncryptionService(
      new EnvironmentService(new ConfigService()), 
    );*/
  }

  async fetchFileStreamFromURL(file_url: string) {
    return fs.createReadStream(file_url);
  }

  async getUserUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      return res.id_tcg_user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUsersUUidFromRemoteIds(
    remoteIds: string[],
    remote_platform: string,
  ) {
    try {
      const res = await this.prisma.tcg_users.findMany({
        where: {
          remote_id: {
            in: remoteIds,
          },
          remote_platform: remote_platform,
        },
        select: {
          id_tcg_user: true,
        },
        distinct: ['id_tcg_user'],
      });
      if (!res || res.length === 0) {
        return [];
      }
      return res?.map((user) => user.id_tcg_user);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) throw new Error(`tcg_user not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContactUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      return res.id_tcg_contact;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContactRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          id_tcg_contact: uuid,
        },
      });
      if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteDataByResourceOwnerId(uuid: string) {
    const remoteData = await this.prisma.remote_data.findFirst({
      where: {
        ressource_owner_id: uuid,
      },
    });
    return remoteData;
  }

  async getAsigneeRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) return;
      /*throw new Error(
          `tcg_user not found for uuid ${uuid} and integration ${remote_platform}`,
        );*/
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAssigneeMetadataFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findUnique({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) throw new Error(`tcg_user not found for uuid ${uuid}`);
      return res.email_address;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCollectionUuidFromRemoteId(
    remote_id: string,
    remote_platform: string,
  ) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      return res.id_tcg_collection;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCollectionRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          id_tcg_collection: uuid,
        },
      });
      if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTicketUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) return;
      return res.id_tcg_ticket;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTicketRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          id_tcg_ticket: uuid,
        },
      });
      if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAssigneeFromUuids(uuids: string[]) {
    try {
      const res = await this.prisma.tcg_users.findMany({
        where: {
          id_tcg_user: {
            in: uuids,
          },
        },
        distinct: ['id_tcg_user'],
      });
      if (!res || res?.length === 0) {
        return [];
      }
      return res;
    } catch (err) {
      throw new Error(err);
    }
  }

  getPaginateUrl(apiUrl: string, provider: string, pageMeta: Pagination) {
    switch (provider) {
      case 'gitlab':
        const queryParams = new URLSearchParams(pageMeta?.queryParams ?? '');
        const links = pageMeta?.links;
        if (pageMeta.isFirstPage) {
          apiUrl = `${apiUrl}?pagination=keyset&per_page=${
            process.env.GITLAB_PAGINATION_SIZE
          }${queryParams ? `&${queryParams}` : ''}`;
        } else {
          apiUrl =
            links?.next ??
            links?.last ??
            `${apiUrl}${queryParams ? `?${queryParams}` : ''}`;
        }
        if (pageMeta) {
          pageMeta.isFirstPage = false;
        }
        return apiUrl;
      default:
        return '';
    }
  }
  extractPaginationDetailsFromResponse(
    res: AxiosResponse<any, any>,
    provider: string,
    pageSize?: number,
  ) {
    switch (provider) {
      case 'gitlab':
        // if data is empty return no links;
        if (
          !res?.data ||
          (res?.data &&
            (res.data.length === 0 ||
              res.data.length <
                (pageSize || process.env.GITLAB_PAGINATION_SIZE)))
        ) {
          return {};
        }
        const linkHeader = res?.headers?.link ?? '';
        const pattern = /<([^>]+)>; rel="([^"]+)"/g;
        const links: Record<string, string> = {};

        let match;
        while ((match = pattern.exec(linkHeader)) !== null) {
          const [, url, rel] = match;
          links[rel] = url;
        }
        return links;
      default:
        return {};
    }
  }

  getLastPageStatus(pageMeta: Pagination, provider: string) {
    switch (provider) {
      case 'gitlab':
        const links = pageMeta?.links;
        if (!links) {
          return true;
        }
        return (
          (links.first && links.first === links.last) ||
          (!links.next && !links.last)
        );
      default:
        return true;
    }
  }

  async fetchDataRecursively(
    serviceHandler: (
      pageMeta?: Record<string, any>,
    ) => Promise<ApiResponse<TicketingObjectOutput[]>>,
    saveToDbHandler: (
      resp: ApiResponse<TicketingObjectOutput[]>,
    ) => Promise<void>,
    pageMeta: Pagination,
  ) {
    const resp: ApiResponse<TicketingObjectOutput[]> = await serviceHandler(
      pageMeta,
    );
    await saveToDbHandler(resp);
    if (
      resp?.data?.length >= 1 &&
      resp?.pageMeta &&
      'isLastPage' in resp.pageMeta &&
      !resp.pageMeta.isLastPage
    ) {
      await this.fetchDataRecursively(
        serviceHandler,
        saveToDbHandler,
        resp.pageMeta,
      );
    }
  }

  async sendRequestWithRetry(options, retries = 3, delay = 1000) {
    try {
      const resp = await axios(options);
      return resp;
    } catch (error) {
      if (error && retries > 0) {
        const retryAfter =
          (parseInt(error?.response?.headers?.['retry-after'], 10) || 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return this.sendRequestWithRetry(options, retries - 1, delay * 2);
      }
      throw error;
    }
  }
}

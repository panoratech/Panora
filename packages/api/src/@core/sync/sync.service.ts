import { Injectable } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { ConnectorCategory } from '@panora/shared';
import { ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '../@core-services/registries/core-sync.registry';
@Injectable()
export class CoreSyncService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private registry: CoreSyncRegistry,
  ) {
    this.logger.setContext(CoreSyncService.name);
  }

  //Initial sync which will execute when connection is successfully established
  async initialSync(vertical: string, provider: string, linkedUserId: string) {
    try {
      switch (vertical) {
        case ConnectorCategory.Crm:
          await this.handleCrmSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Ticketing:
          await this.handleTicketingSync(provider, linkedUserId);
          break;
        case ConnectorCategory.FileStorage:
          await this.handleFileStorageSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Ats:
          await this.handleAtsSync(provider, linkedUserId);
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  async handleCrmSync(provider: string, linkedUserId: string) {
    const tasks = [
      () =>
        this.registry.getService('crm', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('crm', 'company').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('crm', 'contact').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('crm', 'deal').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];

    for (const type of ENGAGEMENTS_TYPE) {
      tasks.push(() =>
        this.registry.getService('crm', 'engagement').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          engagement_type: type,
        }),
      );
    }

    tasks.push(() =>
      this.registry.getService('crm', 'note').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
      }),
    );
    tasks.push(() =>
      this.registry.getService('crm', 'task').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
      }),
    );

    // Execute all tasks and handle results
    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Task failed: ${error.message}`, error);
      }
    }

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    const deals = await this.prisma.crm_deals.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const stageTasks = deals.map(
      (deal) => async () =>
        this.registry.getService('crm', 'stage').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          deal_id: deal.id_crm_deal,
        }),
    );

    // Execute all tasks and handle results
    for (const task of stageTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Stage Task failed: ${error.message}`, error);
      }
    }
  }

  async handleTicketingSync(provider: string, linkedUserId: string) {
    //todo: define here the topological order PER provider
    const tasks = [
      () =>
        this.registry.getService('ticketing', 'collection').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'ticket').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'team').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'account').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'contact').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Task failed: ${error.message}`, error);
      }
    }
    const tickets = await this.prisma.tcg_tickets.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const ticketCommentTasks = tickets.map(
      (ticket) => async () =>
        this.registry.getService('ticketing', 'comment').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_ticket: ticket.id_tcg_ticket,
        }),
    );

    const ticketTagsTasks = tickets.map(
      (ticket) => async () =>
        this.registry.getService('ticketing', 'tag').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_ticket: ticket.id_tcg_ticket,
        }),
    );

    for (const task of ticketCommentTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Ticket Comment task failed: ${error.message}`,
          error,
        );
      }
    }

    for (const task of ticketTagsTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Ticket Tags task failed: ${error.message}`, error);
      }
    }
  }

  async handleFileStorageSync(provider: string, linkedUserId: string) {
    const tasks = [
      () =>
        this.registry.getService('filestorage', 'group').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'drive').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'folder').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];
    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`File Storage Task failed: ${error.message}`, error);
      }
    }

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    const folders = await this.prisma.fs_folders.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });
    const filesTasks = folders.map(
      (folder) => async () =>
        this.registry.getService('filestorage', 'file').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_folder: folder.id_fs_folder,
        }),
    );

    for (const task of filesTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`File Task failed: ${error.message}`, error);
      }
    }
  }

  async handleAtsSync(provider: string, linkedUserId: string) {
    const tasks = [
      () =>
        this.registry.getService('ats', 'office').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'department').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'rejectreason').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'jobs').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'jobinterviewstage').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'candidate').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'tag').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'eeocs').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'attachment').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'activity').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'application').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'offer').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'interview').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ats', 'scorecard').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];
    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`File Storage Task failed: ${error.message}`, error);
      }
    }
  }

  // we must have a sync_jobs table with 7 (verticals) rows, one of each is syncing details
  async getSyncStatus(vertical: string) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async resync(vertical: string, providerName: string, linkedUserId: string) {
    try {
      await this.initialSync(
        vertical.toLowerCase(),
        providerName.toLowerCase(),
        linkedUserId,
      );
      return {
        timestamp: new Date(),
        vertical: vertical,
        provider: providerName,
        status: `SYNCING`,
      };
    } catch (error) {
      throw error;
    }
  }
}

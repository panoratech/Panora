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

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    // Execute all tasks and handle results
    const results = await Promise.allSettled(tasks.map((task) => task()));

    const deals = await this.prisma.crm_deals.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const stageTasks = deals.map((deal) =>
      this.registry.getService('crm', 'stage').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
        deal_id: deal.id_crm_deal,
      }),
    );

    const stageResults = await Promise.allSettled(stageTasks);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Task ${index} failed:`, result.reason);
        throw result.reason;
      }
    });

    stageResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Stage task ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
  }

  async handleTicketingSync(provider: string, linkedUserId: string) {
    const tasks = [
      () =>
        this.registry.getService('ticketing', 'ticket').syncForLinkedUser({
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
        this.registry.getService('ticketing', 'collection').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'team').syncForLinkedUser({
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

    const results = await Promise.allSettled(tasks.map((task) => task()));

    const accounts = await this.prisma.tcg_accounts.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });
    let contactTasks = [];
    if (accounts) {
      contactTasks = accounts.map((acc) =>
        this.registry.getService('ticketing', 'contact').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          account_id: acc.id_tcg_account,
        }),
      );
    } else {
      contactTasks = [
        () =>
          this.registry.getService('ticketing', 'contact').syncForLinkedUser({
            integrationId: provider,
            linkedUserId: linkedUserId,
          }),
      ];
    }

    const contactTasksResults = await Promise.allSettled(contactTasks);

    const tickets = await this.prisma.tcg_tickets.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const ticketCommentTasks = tickets.map((ticket) =>
      this.registry.getService('ticketing', 'comment').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
        id_ticket: ticket.id_tcg_ticket,
      }),
    );

    const ticketTagsTasks = tickets.map((ticket) =>
      this.registry.getService('ticketing', 'tag').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
        id_ticket: ticket.id_tcg_ticket,
      }),
    );

    const ticketCommentResults = await Promise.allSettled(ticketCommentTasks);
    const ticketTagsResults = await Promise.allSettled(ticketTagsTasks);

    contactTasksResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `contactTasksResults ${index} failed:`,
          result.reason,
        );
        throw result.reason;
      }
    });
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Task ${index} failed:`, result.reason);
        throw result.reason;
      }
    });

    ticketCommentResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Ticket Comment task ${index} failed:`,
          result.reason,
        );
        throw result.reason;
      }
    });

    ticketTagsResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Ticket Tags task ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
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
      () =>
        this.registry.getService('filestorage', 'file').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];
    const results = await Promise.allSettled(tasks.map((task) => task()));
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
    const results = await Promise.allSettled(tasks.map((task) => task()));
  }

  // we must have a sync_jobs table with 7 (verticals) rows, one of each is syncing details
  async getSyncStatus(vertical: string) {
    try {
    } catch (error) {
      throw error;
    }
  }

  // todo: test behaviour
  async resync(vertical: string, user_id: string) {
    // trigger a resync for the vertical but only for linked_users who belong to user_id account
    const tasks = [];
    try {
      switch (vertical.toLowerCase()) {
        case 'crm':
          tasks.push(
            this.registry.getService('crm', 'company').kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'contact').kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'deal').kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('crm', 'engagement')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'note').kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'stage').kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'task').kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'user').kickstartSync(user_id),
          );
          break;
        case 'ticketing':
          tasks.push(
            this.registry
              .getService('ticketing', 'account')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'collection')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'comment')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'contact')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry.getService('ticketing', 'tag').kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'team')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'ticket')
              .kickstartSync(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'user')
              .kickstartSync(user_id),
          );
          break;
      }
      return {
        timestamp: new Date(),
        vertical: vertical,
        status: `SYNCING`,
      };
    } catch (error) {
      throw error;
    } finally {
      // Handle background tasks completion
      Promise.allSettled(tasks).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            console.log(`Task ${index} completed successfully.`);
          } else if (result.status === 'rejected') {
            console.log(`Task ${index} failed:`, result.reason);
          }
        });
      });
    }
  }
}

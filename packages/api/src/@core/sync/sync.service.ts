import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ConnectorCategory } from '@panora/shared';
import { ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { CoreSyncRegistry } from './registry.service';
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
  async initialSync(
    vertical: string,
    provider: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      switch (vertical) {
        case ConnectorCategory.Crm:
          await this.handleCrmSync(provider, linkedUserId, id_project);
          break;
        case ConnectorCategory.Ticketing:
          await this.handleTicketingSync(provider, linkedUserId, id_project);
          break;
        case ConnectorCategory.FileStorage:
          await this.handleFileStorageSync(provider, linkedUserId, id_project);
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  async handleCrmSync(
    provider: string,
    linkedUserId: string,
    id_project: string,
  ) {
    const tasks = [
      () =>
        this.registry
          .getService('crm', 'user')
          .syncUsersForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('crm', 'company')
          .syncCompaniesForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('crm', 'contact')
          .syncContactsForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('crm', 'deal')
          .syncDealsForLinkedUser(provider, linkedUserId, id_project),
    ];

    for (const type of ENGAGEMENTS_TYPE) {
      tasks.push(() =>
        this.registry
          .getService('crm', 'engagement')
          .syncEngagementsForLinkedUser(
            provider,
            linkedUserId,
            id_project,
            type,
          ),
      );
    }

    tasks.push(() =>
      this.registry
        .getService('crm', 'note')
        .syncNotesForLinkedUser(provider, linkedUserId, id_project),
    );
    tasks.push(() =>
      this.registry
        .getService('crm', 'task')
        .syncTasksForLinkedUser(provider, linkedUserId, id_project),
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
      this.registry
        .getService('crm', 'stage')
        .syncStagesForLinkedUser(
          provider,
          linkedUserId,
          id_project,
          deal.id_crm_deal,
        ),
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

  async handleTicketingSync(
    provider: string,
    linkedUserId: string,
    id_project: string,
  ) {
    const tasks = [
      () =>
        this.registry
          .getService('ticketing', 'ticket')
          .syncTicketsForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('ticketing', 'user')
          .syncUsersForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('ticketing', 'account')
          .syncAccountsForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('ticketing', 'collection')
          .syncCollectionsForLinkedUser(provider, linkedUserId, id_project),
      () =>
        this.registry
          .getService('ticketing', 'team')
          .syncTeamsForLinkedUser(provider, linkedUserId, id_project),
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
        this.registry
          .getService('ticketing', 'contact')
          .syncContactsForLinkedUser(
            provider,
            linkedUserId,
            id_project,
            acc.id_tcg_account,
          ),
      );
    } else {
      contactTasks = [
        () =>
          this.registry
            .getService('ticketing', 'contact')
            .syncContactsForLinkedUser(provider, linkedUserId, id_project),
      ];
    }

    const contactTasksResults = await Promise.allSettled(contactTasks);

    const tickets = await this.prisma.tcg_tickets.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const ticketCommentTasks = tickets.map((ticket) =>
      this.registry
        .getService('ticketing', 'comment')
        .syncCommentsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
          ticket.id_tcg_ticket,
        ),
    );

    const ticketTagsTasks = tickets.map((ticket) =>
      this.registry
        .getService('ticketing', 'tag')
        .syncTagsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
          ticket.id_tcg_ticket,
        ),
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

  async handleFileStorageSync(
    provider: string,
    linkedUserId: string,
    id_project: string,
  ) {
    //TODO
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
            this.registry.getService('crm', 'company').syncCompanies(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'contact').syncContacts(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'deal').syncDeals(user_id),
          );
          tasks.push(
            this.registry
              .getService('crm', 'engagement')
              .syncEngagements(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'note').syncNotes(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'stage').syncStages(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'task').syncTasks(user_id),
          );
          tasks.push(
            this.registry.getService('crm', 'user').syncUsers(user_id),
          );
          break;
        case 'ticketing':
          tasks.push(
            this.registry
              .getService('ticketing', 'account')
              .syncAccounts(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'collection')
              .syncCollections(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'comment')
              .syncComments(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'contact')
              .syncContacts(user_id),
          );
          tasks.push(
            this.registry.getService('ticketing', 'tag').syncTags(user_id),
          );
          tasks.push(
            this.registry.getService('ticketing', 'team').syncTeams(user_id),
          );
          tasks.push(
            this.registry
              .getService('ticketing', 'ticket')
              .syncTickets(user_id),
          );
          tasks.push(
            this.registry.getService('ticketing', 'user').syncUsers(user_id),
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

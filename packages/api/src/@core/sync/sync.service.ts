import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ConnectorCategory } from '@panora/shared';
import { ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { SyncService as CrmCompanySyncService } from '@crm/company/sync/sync.service';
import { SyncService as CrmContactSyncService } from '@crm/contact/sync/sync.service';
import { SyncService as CrmDealSyncService } from '@crm/deal/sync/sync.service';
import { SyncService as CrmEngagementSyncService } from '@crm/engagement/sync/sync.service';
import { SyncService as CrmNoteSyncService } from '@crm/note/sync/sync.service';
import { SyncService as CrmStageSyncService } from '@crm/stage/sync/sync.service';
import { SyncService as CrmTaskSyncService } from '@crm/task/sync/sync.service';
import { SyncService as CrmUserSyncService } from '@crm/user/sync/sync.service';
import { SyncService as TicketingAccountSyncService } from '@ticketing/account/sync/sync.service';
import { SyncService as TicketingCollectionSyncService } from '@ticketing/collection/sync/sync.service';
import { SyncService as TicketingCommentSyncService } from '@ticketing/comment/sync/sync.service';
import { SyncService as TicketingContactSyncService } from '@ticketing/contact/sync/sync.service';
import { SyncService as TicketingTagSyncService } from '@ticketing/tag/sync/sync.service';
import { SyncService as TicketingTeamSyncService } from '@ticketing/team/sync/sync.service';
import { SyncService as TicketingTicketSyncService } from '@ticketing/ticket/sync/sync.service';
import { SyncService as TicketingUserSyncService } from '@ticketing/user/sync/sync.service';
import { throwTypedError, CoreSyncError } from '@@core/utils/errors';

@Injectable()
export class CoreSyncService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private CrmCompanySyncService: CrmCompanySyncService,
    private CrmContactSyncService: CrmContactSyncService,
    private CrmDealSyncService: CrmDealSyncService,
    private CrmEngagementSyncService: CrmEngagementSyncService,
    private CrmNoteSyncService: CrmNoteSyncService,
    private CrmStageSyncService: CrmStageSyncService,
    private CrmTaskSyncService: CrmTaskSyncService,
    private CrmUserSyncService: CrmUserSyncService,
    private TicketingAccountSyncService: TicketingAccountSyncService,
    private TicketingCollectionSyncService: TicketingCollectionSyncService,
    private TicketingCommentSyncService: TicketingCommentSyncService,
    private TicketingContactSyncService: TicketingContactSyncService,
    private TicketingTagSyncService: TicketingTagSyncService,
    private TicketingTeamSyncService: TicketingTeamSyncService,
    private TicketingTicketSyncService: TicketingTicketSyncService,
    private TicketingUserSyncService: TicketingUserSyncService,
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
      }
    } catch (error) {
      /*throwTypedError(
        new CoreSyncError({
          name: 'INITIAL_SYNC_ERROR',
          message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
            {
              vertical,
              provider,
              linkedUserId,
              id_project,
            },
          )}`,
          cause: error,
        }),
        this.logger,
      );*/
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
        this.CrmUserSyncService.syncUsersForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.CrmCompanySyncService.syncCompaniesForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.CrmCompanySyncService.syncCompaniesForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.CrmContactSyncService.syncContactsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.CrmDealSyncService.syncDealsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
    ];

    for (const type of ENGAGEMENTS_TYPE) {
      tasks.push(() =>
        this.CrmEngagementSyncService.syncEngagementsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
          type,
        ),
      );
    }

    tasks.push(() =>
      this.CrmNoteSyncService.syncNotesForLinkedUser(
        provider,
        linkedUserId,
        id_project,
      ),
    );
    tasks.push(() =>
      this.CrmTaskSyncService.syncTasksForLinkedUser(
        provider,
        linkedUserId,
        id_project,
      ),
    );

    // Execute all tasks and handle results
    const results = await Promise.allSettled(tasks.map((task) => task()));

    const deals = await this.prisma.crm_deals.findMany({
      where: {
        remote_platform: provider,
        id_linked_user: linkedUserId,
      },
    });

    const stageTasks = deals.map((deal) =>
      this.CrmStageSyncService.syncStagesForLinkedUser(
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
        throwTypedError(
          new CoreSyncError({
            name: 'CRM_INITIAL_SYNC_ERROR',
            message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
              {
                vertical: 'crm',
                provider,
                linkedUserId,
                id_project,
              },
            )}`,
            cause: result.reason,
          }),
          this.logger,
        );
      }
    });

    stageResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Stage task ${index} failed:`, result.reason);
        throwTypedError(
          new CoreSyncError({
            name: 'CRM_INITIAL_SYNC_ERROR',
            message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
              {
                vertical: 'crm',
                provider,
                linkedUserId,
                id_project,
              },
            )}`,
            cause: result.reason,
          }),
          this.logger,
        );
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
        this.TicketingTicketSyncService.syncTicketsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.TicketingUserSyncService.syncUsersForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.TicketingAccountSyncService.syncAccountsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.TicketingCollectionSyncService.syncCollectionsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
      () =>
        this.TicketingTeamSyncService.syncTeamsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
        ),
    ];

    const results = await Promise.allSettled(tasks.map((task) => task()));

    const accounts = await this.prisma.tcg_accounts.findMany({
      where: {
        remote_platform: provider,
        id_linked_user: linkedUserId,
      },
    });
    let contactTasks = [];
    if (accounts) {
      contactTasks = accounts.map((acc) =>
        this.TicketingContactSyncService.syncContactsForLinkedUser(
          provider,
          linkedUserId,
          id_project,
          acc.id_tcg_account,
        ),
      );
    } else {
      contactTasks = [
        () =>
          this.TicketingContactSyncService.syncContactsForLinkedUser(
            provider,
            linkedUserId,
            id_project,
          ),
      ];
    }
    const contactTasksResults = await Promise.allSettled(contactTasks);

    const tickets = await this.prisma.tcg_tickets.findMany({
      where: {
        remote_platform: provider,
        id_linked_user: linkedUserId,
      },
    });

    const ticketCommentTasks = tickets.map((ticket) =>
      this.TicketingCommentSyncService.syncCommentsForLinkedUser(
        provider,
        linkedUserId,
        id_project,
        ticket.id_tcg_ticket,
      ),
    );

    const ticketTagsTasks = tickets.map((ticket) =>
      this.TicketingTagSyncService.syncTagsForLinkedUser(
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
        /*throwTypedError(
          new CoreSyncError({
            name: 'CRM_INITIAL_SYNC_ERROR',
            message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
              {
                vertical: 'ticketing',
                provider,
                linkedUserId,
                id_project,
              },
            )}`,
            cause: result.reason,
          }),
          this.logger,
        );*/
        throw result.reason;
      }
    });
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Task ${index} failed:`, result.reason);
        /*throwTypedError(
          new CoreSyncError({
            name: 'CRM_INITIAL_SYNC_ERROR',
            message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
              {
                vertical: 'ticketing',
                provider,
                linkedUserId,
                id_project,
              },
            )}`,
            cause: result.reason,
          }),
          this.logger,
        );*/
        throw result.reason;
      }
    });

    ticketCommentResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Ticket Comment task ${index} failed:`,
          result.reason,
        );
        throwTypedError(
          new CoreSyncError({
            name: 'CRM_INITIAL_SYNC_ERROR',
            message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
              {
                vertical: 'ticketing',
                provider,
                linkedUserId,
                id_project,
              },
            )}`,
            cause: result.reason,
          }),
          this.logger,
        );
      }
    });

    ticketTagsResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Ticket Tags task ${index} failed:`, result.reason);
        throwTypedError(
          new CoreSyncError({
            name: 'CRM_INITIAL_SYNC_ERROR',
            message: `CoreSyncService.initialSync() call failed with args ---> ${JSON.stringify(
              {
                vertical: 'ticketing',
                provider,
                linkedUserId,
                id_project,
              },
            )}`,
            cause: result.reason,
          }),
          this.logger,
        );
      }
    });
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
    // premium feature
    // trigger a resync for the vertical but only for linked_users who belong to user_id account
    const tasks = [];
    try {
      switch (vertical.toLowerCase()) {
        case 'crm':
          tasks.push(this.CrmCompanySyncService.syncCompanies(user_id));
          tasks.push(this.CrmContactSyncService.syncContacts(user_id));
          tasks.push(this.CrmDealSyncService.syncDeals(user_id));
          tasks.push(this.CrmEngagementSyncService.syncEngagements(user_id));
          tasks.push(this.CrmNoteSyncService.syncNotes(user_id));
          tasks.push(this.CrmStageSyncService.syncStages(user_id));
          tasks.push(this.CrmTaskSyncService.syncTasks(user_id));
          tasks.push(this.CrmUserSyncService.syncUsers(user_id));
          break;
        case 'ticketing':
          tasks.push(this.TicketingAccountSyncService.syncAccounts(user_id));
          tasks.push(
            this.TicketingCollectionSyncService.syncCollections(user_id),
          );
          tasks.push(this.TicketingCommentSyncService.syncComments(user_id));
          tasks.push(this.TicketingContactSyncService.syncContacts(user_id));
          tasks.push(this.TicketingTagSyncService.syncTags(user_id));
          tasks.push(this.TicketingTeamSyncService.syncTeams(user_id));
          tasks.push(this.TicketingTicketSyncService.syncTickets(user_id));
          tasks.push(this.TicketingUserSyncService.syncUsers(user_id));
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

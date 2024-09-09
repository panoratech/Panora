import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalTeamOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_teams as TicketingTeam } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ITeamService } from '../types';
import { UnifiedTicketingTeamOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'team', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our tcg_teams table
  //its role is to fetch all teams from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = TICKETING_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ITeamService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: team} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingTeamOutput,
        OriginalTeamOutput,
        ITeamService
      >(integrationId, linkedUserId, 'ticketing', 'team', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    teams: UnifiedTicketingTeamOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingTeam[]> {
    try {
      const teams_results: TicketingTeam[] = [];

      const updateOrCreateTeam = async (
        team: UnifiedTicketingTeamOutput,
        originId: string,
        connection_id: string,
      ) => {
        const existingTeam = await this.prisma.tcg_teams.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: team.name ?? null,
          description: team.description ?? null,
          modified_at: new Date(),
        };

        if (existingTeam) {
          return await this.prisma.tcg_teams.update({
            where: {
              id_tcg_team: existingTeam.id_tcg_team,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.tcg_teams.create({
            data: {
              ...baseData,
              id_tcg_team: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const originId = team.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateTeam(team, originId, connection_id);
        const team_id = res.id_tcg_team;
        teams_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          team.field_mappings,
          team_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(team_id, remote_data[i]);
      }
      return teams_results;
    } catch (error) {
      throw error;
    }
  }
}

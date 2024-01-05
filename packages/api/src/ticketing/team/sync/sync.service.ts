import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTeamOutput } from '../types/model.unified';
import { ITeamService } from '../types';
import { tcg_teams as TicketingTeam } from '@prisma/client';
import { OriginalTeamOutput } from '@@core/utils/types/original/original.ticketing';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.syncTeams();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our tcg_teams table
  //its role is to fetch all teams from providers 3rd parties and save the info inside our db
  async syncTeams() {
    try {
      this.logger.log(`Syncing teams....`);
      const defaultOrg = await this.prisma.organizations.findFirst({
        where: {
          name: 'Acme Inc',
        },
      });

      const defaultProject = await this.prisma.projects.findFirst({
        where: {
          id_organization: defaultOrg.id_organization,
          name: 'Project 1',
        },
      });
      const id_project = defaultProject.id_project;
      const linkedTeams = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedTeams.map(async (linkedTeam) => {
        try {
          const providers = TICKETING_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncTeamsForLinkedTeam(
                provider,
                linkedTeam.id_linked_user,
                id_project,
              );
            } catch (error) {
              handleServiceError(error, this.logger);
            }
          }
        } catch (error) {
          handleServiceError(error, this.logger);
        }
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncTeamsForLinkedTeam(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} teams for linkedTeam ${linkedUserId}`,
      );
      // check if linkedTeam has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
        },
      });
      if (!connection) throw new Error('connection not found');

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'team',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ITeamService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTeamOutput[]> = await service.syncTeams(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalTeamOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalTeamOutput[]>({
        sourceObject,
        targetType: TicketingObject.team,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedTeamOutput[];

      //TODO
      const teamIds = sourceObject.map((team) =>
        'id' in team ? String(team.id) : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const team_data = await this.saveTeamsInDb(
        linkedUserId,
        unifiedObject,
        teamIds,
        integrationId,
        sourceObject,
      );

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.team.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.handleWebhook(
        team_data,
        'ticketing.team.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveTeamsInDb(
    linkedUserId: string,
    teams: UnifiedTeamOutput[],
    originIds: string[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingTeam[]> {
    try {
      let teams_results: TicketingTeam[] = [];
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingTeam = await this.prisma.tcg_teams.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_team_id: string;

        if (existingTeam) {
          // Update the existing ticket
          const res = await this.prisma.tcg_teams.update({
            where: {
              id_tcg_team: existingTeam.id_tcg_team,
            },
            data: {
              name: existingTeam.name,
              description: team.description,
              modified_at: new Date(),
            },
          });
          unique_ticketing_team_id = res.id_tcg_team;
          teams_results = [...teams_results, res];
        } else {
          // Create a new team
          this.logger.log('not existing team ' + team.name);
          const data = {
            id_tcg_team: uuidv4(),
            name: team.name,
            description: team.description,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };
          const res = await this.prisma.tcg_teams.create({
            data: data,
          });
          teams_results = [...teams_results, res];
          unique_ticketing_team_id = res.id_tcg_team;
        }

        // check duplicate or existing values
        if (team.field_mappings && team.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_team_id,
            },
          });

          for (const mapping of team.field_mappings) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: Object.keys(mapping)[0],
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: Object.values(mapping)[0]
                    ? Object.values(mapping)[0]
                    : 'null',
                  attribute: {
                    connect: {
                      id_attribute: attribute.id_attribute,
                    },
                  },
                  entity: {
                    connect: {
                      id_entity: entity.id_entity,
                    },
                  },
                },
              });
            }
          }
        }

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_team_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_team_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return teams_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}

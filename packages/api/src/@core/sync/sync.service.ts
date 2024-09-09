import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectorCategory, getCommonObjectsForVertical } from '@panora/shared';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CoreSyncRegistry } from '../@core-services/registries/core-sync.registry';
import { UpdatePullFrequencyDto } from './sync.controller';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoreSyncService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
  ) {
    this.logger.setContext(CoreSyncService.name);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAndKickstartSync(user_id?: string) {
    const users = user_id
      ? [
          await this.prisma.users.findUnique({
            where: {
              id_user: user_id,
            },
          }),
        ]
      : await this.prisma.users.findMany();
    if (users && users.length > 0) {
      for (const user of users) {
        const projects = await this.prisma.projects.findMany({
          where: {
            id_user: user.id_user,
          },
        });
        for (const project of projects) {
          const projectSyncConfig =
            await this.prisma.projects_pull_frequency.findFirst({
              where: {
                id_project: project.id_project,
              },
            });

          if (projectSyncConfig) {
            const syncIntervals = {
              crm: projectSyncConfig.crm,
              ats: projectSyncConfig.ats,
              hris: projectSyncConfig.hris,
              accounting: projectSyncConfig.accounting,
              filestorage: projectSyncConfig.filestorage,
              ecommerce: projectSyncConfig.ecommerce,
              ticketing: projectSyncConfig.ticketing,
            };

            for (const [vertical, interval] of Object.entries(syncIntervals)) {
              const now = new Date();
              const lastSyncEvent = await this.prisma.events.findFirst({
                where: {
                  id_project: project.id_project,
                  type: `${vertical}.batchSyncStart`,
                },
                orderBy: {
                  timestamp: 'desc',
                },
              });

              const lastSyncTime = lastSyncEvent
                ? lastSyncEvent.timestamp
                : new Date(0);

              const hoursSinceLastSync =
                (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
              if (interval && hoursSinceLastSync >= interval) {
                await this.prisma.events.create({
                  data: {
                    id_project: project.id_project,
                    id_event: uuidv4(),
                    status: 'success',
                    type: `${vertical}.batchSyncStart`,
                    method: 'GET',
                    url: '',
                    provider: '',
                    direction: '0',
                    timestamp: new Date(),
                  },
                });
                const commonObjects = getCommonObjectsForVertical(vertical);
                for (const commonObject of commonObjects) {
                  const service = this.registry.getService(
                    vertical,
                    commonObject,
                  );
                  if (service) {
                    try {
                      const cronExpression = this.convertIntervalToCron(
                        Number(interval),
                      );

                      await this.bullQueueService.queueSyncJob(
                        `${vertical}-sync-${commonObject}s`,
                        {
                          projectId: project.id_project,
                          vertical,
                          commonObject,
                        },
                        cronExpression,
                      );
                      this.logger.log(
                        `Synced ${vertical}.${commonObject} for project ${project.id_project}`,
                      );
                    } catch (error) {
                      this.logger.error(
                        `Error syncing ${vertical}.${commonObject} for project ${project.id_project}: ${error.message}`,
                        error,
                      );
                    }
                  } else {
                    this.logger.warn(
                      `No service found for ${vertical}.${commonObject}`,
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private convertIntervalToCron(intervalSeconds: number): string {
    // If the interval is less than 1 minute, we'll set it to run every minute
    if (intervalSeconds < 60) {
      return '* * * * *';
    }

    // If the interval is less than 1 hour, use minutes
    if (intervalSeconds < 3600) {
      const minutes = Math.floor(intervalSeconds / 60);
      return `*/${minutes} * * * *`;
    }

    // If the interval is less than 1 day, use hours
    if (intervalSeconds < 86400) {
      const hours = Math.floor(intervalSeconds / 3600);
      return `0 */${hours} * * *`;
    }

    // For intervals of 1 day or more, use days
    const days = Math.floor(intervalSeconds / 86400);
    return `0 0 */${days} * *`;
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
        case ConnectorCategory.Hris:
          await this.handleHrisSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Accounting:
          await this.handleAccountingSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Ecommerce:
          await this.handleEcommerceSync(provider, linkedUserId);
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  // todo
  async handleAccountingSync(provider: string, linkedUserId: string) {
    return;
  }

  async handleHrisSync(provider: string, linkedUserId: string) {
    // add other objects when i have info on the order
    //todo: define here the topological order PER provider
    const tasks = [
      () =>
        this.registry.getService('hris', 'company').syncForLinkedUser({
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
    const companies = await this.prisma.hris_companies.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const companiesEmployeeTasks = companies.map(
      (company) => async () =>
        this.registry.getService('hris', 'employee').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_company: company.id_hris_company,
        }),
    );

    const companiesEmployerBenefitsTasks = companies.map(
      (company) => async () =>
        this.registry.getService('hris', 'employerbenefit').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_company: company.id_hris_company,
        }),
    );

    const companiesGroupsTasks = companies.map(
      (company) => async () =>
        this.registry.getService('hris', 'group').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_company: company.id_hris_company,
        }),
    );

    const employees = await this.prisma.hris_employees.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const employeesBenefitsTasks = employees.map(
      (employee) => async () =>
        this.registry.getService('hris', 'benefit').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_employee: employee.id_hris_employee,
        }),
    );

    const employeesLocationsTasks = employees.map(
      (employee) => async () =>
        this.registry.getService('hris', 'location').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_employee: employee.id_hris_employee,
        }),
    );

    for (const task of companiesEmployeeTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Companies Employee task failed: ${error.message}`,
          error,
        );
      }
    }

    for (const task of employeesLocationsTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Companies Location task failed: ${error.message}`,
          error,
        );
      }
    }

    for (const task of companiesEmployerBenefitsTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Companies Employer Benefits task failed: ${error.message}`,
          error,
        );
      }
    }

    for (const task of companiesGroupsTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Companies Groups task failed: ${error.message}`,
          error,
        );
      }
    }

    for (const task of employeesBenefitsTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Employees Benefits task failed: ${error.message}`,
          error,
        );
      }
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
        console.log(error);
        this.logger.error(`File Task failed: ${error.message}`, error);
      }
    }
  }

  async handleEcommerceSync(provider: string, linkedUserId: string) {
    const tasks = [
      () =>
        this.registry.getService('ecommerce', 'customer').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ecommerce', 'product').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ecommerce', 'order').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];
    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Ecommerce Task failed: ${error.message}`, error);
      }
    }

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    const orders = await this.prisma.ecom_orders.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    const fulfTasks = orders.map(
      (order) => async () =>
        this.registry.getService('ecommerce', 'fulfillment').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_order: order.id_ecom_order,
        }),
    );

    for (const task of fulfTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Fulfillment Task failed: ${error.message}`, error);
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

  async updatePullFrequency(data: UpdatePullFrequencyDto, projectId: string) {
    return await this.prisma.projects_pull_frequency.upsert({
      where: { id_project: projectId },
      update: {
        ...data,
        modified_at: new Date(),
      },
      create: {
        id_projects_pull_frequency: uuidv4(),
        id_project: projectId,
        ...data,
      },
    });
  }

  async getPullFrequency(projectId: string) {
    return await this.prisma.projects_pull_frequency.findFirst({
      where: { id_project: projectId },
    });
  }
}

import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { SyncError, throwTypedError } from '@@core/utils/errors';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { tcg_comments as TicketingComment } from '@prisma/client';
import { UnifiedCommentOutput } from '../types/model.unified';
import { ICommentService } from '../types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../services/registry.service';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ticketing-sync-comments';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
  }
  //function used by sync worker which populate our tcg_comments table
  //its role is to fetch all comments from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncComments(user_id?: string) {
    try {
      this.logger.log(`Syncing comments....`);
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
            const id_project = project.id_project;
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
                    //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
                    const tickets = await this.prisma.tcg_tickets.findMany({
                      where: {
                        remote_platform: provider,
                        id_linked_user: linkedUser.id_linked_user,
                      },
                    });
                    for (const ticket of tickets) {
                      await this.syncCommentsForLinkedUser(
                        provider,
                        linkedUser.id_linked_user,
                        id_project,
                        ticket.id_tcg_ticket,
                      );
                    }
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncCommentsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    id_ticket: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} comments for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ticketing',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping comments syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.comment',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ICommentService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalCommentOutput[]> =
        await service.syncComments(linkedUserId, id_ticket, remoteProperties);

      const sourceObject: OriginalCommentOutput[] = resp.data;

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalCommentOutput[]
      >({
        sourceObject,
        targetType: TicketingObject.comment,
        providerName: integrationId,
        vertical: 'ticketing',
        customFieldMappings,
      })) as UnifiedCommentOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const comments_data = await this.saveCommentsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        id_ticket,
        sourceObject,
      );

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.comment.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        comments_data,
        'ticketing.comment.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveCommentsInDb(
    linkedUserId: string,
    comments: UnifiedCommentOutput[],
    originSource: string,
    id_ticket: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingComment[]> {
    try {
      let comments_results: TicketingComment[] = [];
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const originId = comment.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingComment = await this.prisma.tcg_comments.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_comment_id: string;
        const opts =
          comment.creator_type === 'CONTACT' && comment.contact_id
            ? {
                id_tcg_contact: comment.contact_id,
              }
            : comment.creator_type === 'USER' && comment.user_id
            ? {
                id_tcg_user: comment.user_id,
              }
            : {};
        //case where nothing is passed for creator or a not authorized value;

        if (existingComment) {
          // Update the existing comment
          let data: any = {
            id_tcg_ticket: comment.ticket_id,
            modified_at: new Date(),
          };
          if (comment.body) {
            data = { ...data, body: comment.body };
          }
          if (comment.html_body) {
            data = { ...data, html_body: comment.html_body };
          }
          if (comment.is_private) {
            data = { ...data, is_private: comment.is_private };
          }
          if (comment.creator_type) {
            data = { ...data, creator_type: comment.creator_type };
          }
          data = { ...data, ...opts };
          const res = await this.prisma.tcg_comments.update({
            where: {
              id_tcg_comment: existingComment.id_tcg_comment,
            },
            data: data,
          });
          unique_ticketing_comment_id = res.id_tcg_comment;
          comments_results = [...comments_results, res];
        } else {
          // Create a new comment
          this.logger.log('comment not exists');
          let data: any = {
            id_tcg_comment: uuidv4(),
            created_at: new Date(),
            modified_at: new Date(),
            id_tcg_ticket: comment.ticket_id,
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (comment.body) {
            data = { ...data, body: comment.body };
          }
          if (comment.html_body) {
            data = { ...data, html_body: comment.html_body };
          }
          if (comment.is_private) {
            data = { ...data, is_private: comment.is_private };
          }
          if (comment.creator_type) {
            data = { ...data, creator_type: comment.creator_type };
          }

          data = { ...data, ...opts };

          const res = await this.prisma.tcg_comments.create({
            data: data,
          });
          comments_results = [...comments_results, res];
          unique_ticketing_comment_id = res.id_tcg_comment;
        }

        // now insert the attachment of the comment inside tcg_attachments
        // we should already have at least initial data (as it must have been inserted by the end linked user before adding comment)
        // though we might sync comments that have been also directly been added to the provider without passing through Panora
        // in this case just create a new attachment row !
        if (comment.attachments && comment.attachments.length > 0) {
          for (const attchmt of comment.attachments) {
            let unique_ticketing_attachmt_id: string;

            const existingAttachmt =
              await this.prisma.tcg_attachments.findFirst({
                where: {
                  remote_platform: originSource,
                  id_linked_user: linkedUserId,
                  file_name: attchmt.file_name,
                },
              });

            if (existingAttachmt) {
              // Update the existing attachmt
              const res = await this.prisma.tcg_attachments.update({
                where: {
                  id_tcg_attachment: existingAttachmt.id_tcg_attachment,
                },
                data: {
                  remote_id: attchmt.id,
                  file_url: attchmt.file_url,
                  id_tcg_comment: unique_ticketing_comment_id,
                  id_tcg_ticket: id_ticket,
                  modified_at: new Date(),
                },
              });
              unique_ticketing_attachmt_id = res.id_tcg_attachment;
            } else {
              // Create a new attachment
              // this.logger.log('attchmt not exists');
              const data = {
                id_tcg_attachment: uuidv4(),
                remote_id: attchmt.id,
                file_name: attchmt.file_name,
                file_url: attchmt.file_url,
                id_tcg_comment: unique_ticketing_comment_id,
                created_at: new Date(),
                modified_at: new Date(),
                uploader: linkedUserId, //TODO
                id_tcg_ticket: id_ticket,
                id_linked_user: linkedUserId,
                remote_platform: originSource,
              };
              const res = await this.prisma.tcg_attachments.create({
                data: data,
              });
              unique_ticketing_attachmt_id = res.id_tcg_attachment;
            }

            //TODO: insert remote_data in db i dont know the type of remote_data to extract the right source attachment object
            /*await this.prisma.remote_data.upsert({
              where: {
                ressource_owner_id: unique_ticketing_attachmt_id,
              },
              create: {
                id_remote_data: uuidv4(),
                ressource_owner_id: unique_ticketing_attachmt_id,
                format: 'json',
                data: JSON.stringify(remote_data[i]),
                created_at: new Date(),
              },
              update: {
                data: JSON.stringify(remote_data[i]),
                created_at: new Date(),
              },
            });*/
          }
        }

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_comment_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_comment_id,
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
      return comments_results;
    } catch (error) {
      throw error;
    }
  }
}

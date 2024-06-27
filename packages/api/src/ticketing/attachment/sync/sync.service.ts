import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IBaseSync } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { tcg_attachments as TicketingAttachment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAttachmentOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private registry: CoreSyncRegistry,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'attachment', this);
  }

  // we don't sync here as it is done within the Comment & Ticket Sync services

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedAttachmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingAttachment[]> {
    try {
      let attachments_results: TicketingAttachment[] = [];
      for (let i = 0; i < data.length; i++) {
        const attachment = data[i];
        const originId = attachment.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingAttachment = await this.prisma.tcg_attachments.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ticketing_attachment_id: string;

        if (existingAttachment) {
          const data: any = {
            id_tcg_ticket: existingAttachment.id_tcg_attachment,
            file_name: existingAttachment.file_name,
            file_url: existingAttachment.file_url,
            uploader: existingAttachment.uploader,
            modified_at: new Date(),
          };
          if (attachment.comment_id) {
            data.id_tcg_comment = attachment.comment_id;
          }
          if (attachment.ticket_id) {
            data.id_tcg_ticket = attachment.ticket_id;
          }
          // Update the existing ticket
          const res = await this.prisma.tcg_attachments.update({
            where: {
              id_tcg_attachment: existingAttachment.id_tcg_attachment,
            },
            data: data,
          });
          unique_ticketing_attachment_id = res.id_tcg_attachment;
          attachments_results = [...attachments_results, res];
        } else {
          // Create a new attachment
          const data: any = {
            id_tcg_attachment: uuidv4(),
            file_name: existingAttachment.file_name,
            file_url: existingAttachment.file_url,
            uploader: existingAttachment.uploader,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };
          if (attachment.comment_id) {
            data.id_tcg_comment = attachment.comment_id;
          }
          if (attachment.ticket_id) {
            data.id_tcg_ticket = attachment.ticket_id;
          }
          const res = await this.prisma.tcg_attachments.create({
            data: data,
          });
          attachments_results = [...attachments_results, res];
          unique_ticketing_attachment_id = res.id_tcg_attachment;
        }

        // check duplicate or existing values
        if (attachment.field_mappings && attachment.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_attachment_id,
            },
          });

          for (const [slug, value] of Object.entries(
            attachment.field_mappings,
          )) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: value || 'null',
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
            ressource_owner_id: unique_ticketing_attachment_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_attachment_id,
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
      return attachments_results;
    } catch (error) {
      throw error;
    }
  }
}

import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { JiraTagOutput } from '@ticketing/tag/services/jira/types';
import { ITicketMapper } from '@ticketing/ticket/types';
import {
  TicketPriority,
  TicketType,
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { JiraTicketInput, JiraTicketOutput } from './types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { UnifiedTicketingCommentOutput } from '@ticketing/comment/types/model.unified';
import {
  JiraCommentInput,
  JiraCommentOutput,
} from '@ticketing/comment/services/jira/types';

@Injectable()
export class JiraTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'jira', this);
  }

  mapToIssueTypeName(data: TicketType) {
    switch (data) {
      case 'BUG':
        return 'Bug';
      case 'SUBTASK':
        return 'Sub-task';
      case 'TASK':
        return 'Task';
      case 'TO-DO':
        return 'Story';
    }
  }

  mapToTicketPriority(
    data: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest',
  ): TicketPriority {
    switch (data) {
      case 'Low':
        return 'LOW';
      case 'Lowest':
        return 'LOW';
      case 'Medium':
        return 'MEDIUM';
      case 'Highest':
        return 'HIGH';
      case 'High':
        return 'HIGH';
    }
  }
  reverseMapToTicketPriority(data: TicketPriority): string {
    switch (data) {
      case 'LOW':
        return 'Low';
      case 'MEDIUM':
        return 'Medium';
      case 'HIGH':
        return 'High';
    }
  }

  async desunify(
    source: UnifiedTicketingTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    connectionId?: string,
  ): Promise<JiraTicketInput> {
    if (!source.collections || !source.collections[0]) {
      throw new ReferenceError(
        'a project key/id is mandatory for Jira ticket creation',
      );
    }
    const project_name = await this.utils.getCollectionNameFromUuid(
      source.collections[0] as string,
    );
    const result: JiraTicketInput = {
      fields: {
        project: {
          key: project_name || undefined,
          id: await this.utils.getCollectionRemoteIdFromUuid(
            source.collections[0] as string,
          ),
        },
        summary: source.description,
        issuetype: {
          name: this.mapToIssueTypeName(source.type as TicketType) || null,
        },
      },
    };

    if (source.assigned_to && source.assigned_to.length > 0) {
      const data = await this.utils.getAsigneeRemoteIdFromUserUuid(
        source.assigned_to[0],
      );
      result.fields.assignee = {
        id: data,
      };
    }

    if (source.tags) {
      result.fields.labels = source.tags as string[];
    }

    /*if (source.priority) {
      result.fields.priority = {
        name: this.reverseMapToTicketPriority(
          source.priority as TicketPriority,
        ),
      };
    }*/

    if (source.attachments) {
      result.attachments = source.attachments as string[]; // dummy assigning we'll insert them in the service func
    }

    if (source.comment) {
      const comment =
        (await this.coreUnificationService.desunify<UnifiedTicketingCommentOutput>(
          {
            sourceObject: source.comment,
            targetType: TicketingObject.comment,
            providerName: 'jira',
            vertical: 'ticketing',
            connectionId: connectionId,
            customFieldMappings: [],
          },
        )) as JiraCommentInput;
      result.fields.comment = [comment];
    }

    // Map custom fields if applicable
    /*TODO if (customFieldMappings && source.field_mappings) {
      result.meta = {}; // Ensure meta exists
      source.field_mappings.forEach((fieldMapping) => {
        customFieldMappings.forEach((mapping) => {
          if (fieldMapping.hasOwnProperty(mapping.slug)) {
            result.meta[mapping.remote_id] = fieldMapping[mapping.slug];
          }
        });
      });
    }*/

    return result;
  }

  async unify(
    source: JiraTicketOutput | JiraTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map((ticket) =>
        this.mapSingleTicketToUnified(
          ticket,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: JiraTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput> {
    /*TODO: const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: ticket.custom_fields?.[mapping.remote_id],
    }));*/

    let opts: any = {};
    if (ticket.fields.assignee) {
      const assigneeId = ticket.fields.assignee.id;
      const user_id = await this.utils.getUserUuidFromRemoteId(
        assigneeId,
        connectionId,
      );
      if (user_id) {
        opts = { ...opts, assigned_to: [user_id] };
      }
    }
    if (ticket.fields.labels) {
      const tags = await this.ingestService.ingestData<
        UnifiedTicketingTagOutput,
        JiraTagOutput
      >(
        ticket.fields.labels.map(
          (label) =>
            ({
              name: label,
            } as JiraTagOutput),
        ),
        'jira',
        connectionId,
        'ticketing',
        TicketingObject.tag,
        [],
      );
      opts.tags = tags.map((tag) => tag.id_tcg_tag);
    }

    //todo : for issue type: a translation is needed as it might be Tache or Task for instance inside ticket.fields.issuetype

    /*TODO if (ticket.fields.attachment && ticket.fields.attachment.length > 0) {
      const attachments = (await this.coreUnificationService.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: ticket.fields.attachment,
        targetType: TicketingObject.attachment,
        providerName: 'jira',
        vertical: 'ticketing',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedTicketingAttachmentOutput[];
      opts = {
        ...opts,
        attachments: attachments,
      };
    }*/

    if (ticket.fields.project) {
      const collection_id = await this.utils.getCollectionUuidFromRemoteId(
        ticket.fields.project.id,
        connectionId,
      );
      if (collection_id) {
        opts.collections = [collection_id];
      }
    }

    const unifiedTicket: UnifiedTicketingTicketOutput = {
      remote_id: ticket.id,
      remote_data: ticket,
      name: ticket.fields.summary,
      description: ticket.fields.description,
      due_date: new Date(ticket.fields.duedate),
      field_mappings: [], //TODO
      ...opts,
    };
    if (ticket.fields.priority && ticket.fields.priority.name) {
      unifiedTicket.priority = this.mapToTicketPriority(
        ticket.fields.priority.name as any,
      );
    }

    return unifiedTicket;
  }
}

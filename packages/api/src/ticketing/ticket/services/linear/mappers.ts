import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ITicketMapper } from '@ticketing/ticket/types';
import {
    UnifiedTicketingTicketInput,
    UnifiedTicketingTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { LinearTicketInput, LinearTicketOutput } from './types';
import { LinearTagInput, LinearTagOutput } from '@ticketing/tag/services/linear/types';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedTicketingCommentOutput } from '@ticketing/comment/types/model.unified';
import { LinearCommentInput } from '@ticketing/comment/services/linear/types';

@Injectable()
export class LinearTicketMapper implements ITicketMapper {
    constructor(
        private mappersRegistry: MappersRegistry,
        private utils: Utils,
        private coreUnificationService: CoreUnification,
        private ingestService: IngestDataService,
    ) {
        this.mappersRegistry.registerService('ticketing', 'ticket', 'linear', this);
    }

    async desunify(
        source: UnifiedTicketingTicketInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
        connectionId?: string,
    ): Promise<LinearTicketInput> {
        // const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(
        //     source.collections[0] as string,
        // );

        const result: LinearTicketInput = {
            title: source.name,
            description: source.description ? source.description : null,
            // Passing new Field to retreive repositroy info to add ticket to that repo
            project: { id: source.collections ? await this.utils.getCollectionRemoteIdFromUuid(source.collections[0] as string) : null },
            team: { id: await this.utils.getTeamRemoteIdFromUuid(source.field_mappings["team_id"]) },
            dueDate: source.due_date.toISOString(),
        };

        if (source.assigned_to && source.assigned_to.length > 0) {
            const data = await this.utils.getAsigneeRemoteIdFromUserUuid(
                source.assigned_to[0],
            );
            if (data) {
                result.assignee = { id: data };
            }
        }
        const tags = source.tags as LinearTagInput[];
        if (tags) {
            result.labels.nodes = tags;
        }

        if (source.comment) {
            const comment =
                (await this.coreUnificationService.desunify<UnifiedTicketingCommentOutput>({
                    sourceObject: source.comment,
                    targetType: TicketingObject.comment,
                    providerName: 'linear',
                    vertical: 'ticketing',
                    connectionId: connectionId,
                    customFieldMappings: [],
                })) as LinearCommentInput;
            result.comments.nodes = [comment];
        }

        // TODO - Custom fields mapping
        // if (customFieldMappings && source.field_mappings) {
        //   result.meta = {}; // Ensure meta exists
        //   for (const [k, v] of Object.entries(source.field_mappings)) {
        //     const mapping = customFieldMappings.find(
        //       (mapping) => mapping.slug === k,
        //     );
        //     if (mapping) {
        //       result.meta[mapping.remote_id] = v;
        //     }
        //   }
        // }

        return result;
    }

    async unify(
        source: LinearTicketOutput | LinearTicketOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]> {
        const sourcesArray = Array.isArray(source) ? source : [source];
        return Promise.all(
            sourcesArray.map(async (ticket) =>
                this.mapSingleTicketToUnified(
                    ticket,
                    connectionId,
                    customFieldMappings,
                ),
            ),
        );
    }

    private async mapSingleTicketToUnified(
        ticket: LinearTicketOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedTicketingTicketOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = ticket[mapping.remote_id];
            }
        }

        let opts: any = {};
        if (ticket.state) {
            opts = { ...opts, type: (ticket.state.name === 'Canceled' || ticket.state.name === 'Done') ? 'CLOSED' : 'OPEN' };
        }

        if (ticket.assignee) {
            //fetch the right assignee uuid from remote id
            const user_id = await this.utils.getUserUuidFromRemoteId(
                String(ticket.assignee.id),
                connectionId,
            );
            if (user_id) {
                opts = { ...opts, assigned_to: [user_id] };
            }
        }

        if (ticket.labels.nodes.length > 0) {
            const tags = await this.ingestService.ingestData<
                UnifiedTicketingTagOutput,
                LinearTagOutput
            >(
                ticket.labels.nodes.map(
                    (label) =>
                    ({
                        name: label.name,
                    } as LinearTagOutput),
                ),
                'linear',
                connectionId,
                'ticketing',
                TicketingObject.tag,
                [],
            );
            opts = {
                ...opts,
                tags: tags.map((tag) => tag.id_tcg_tag),
            };
        }

        if (ticket.project) {
            const tcg_collection_id = await this.utils.getCollectionUuidFromRemoteId(
                String(ticket.project.id),
                connectionId,
            );
            if (tcg_collection_id) {
                opts = { ...opts, collections: [tcg_collection_id] };
            }
        }

        const unifiedTicket: UnifiedTicketingTicketOutput = {
            remote_id: ticket.id,
            remote_data: ticket,
            name: ticket.title,
            description: ticket.description || null,
            due_date: ticket.dueDate ? new Date(ticket.dueDate) : null,
            field_mappings,
            ...opts,
        };

        return unifiedTicket;
    }
}

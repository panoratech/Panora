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
import { GithubTicketInput, GithubTicketOutput } from './types';
import { GithubTagOutput } from '@ticketing/tag/services/github/types';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedTicketingCommentOutput } from '@ticketing/comment/types/model.unified';
import { GithubCommentInput } from '@ticketing/comment/services/github/types';

@Injectable()
export class GithubTicketMapper implements ITicketMapper {
    constructor(
        private mappersRegistry: MappersRegistry,
        private utils: Utils,
        private coreUnificationService: CoreUnification,
        private ingestService: IngestDataService,
    ) {
        this.mappersRegistry.registerService('ticketing', 'ticket', 'github', this);
    }

    async desunify(
        source: UnifiedTicketingTicketInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
        connectionId?: string,
    ): Promise<GithubTicketInput> {
        // const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(
        //     source.collections[0] as string,
        // );

        const result: GithubTicketInput = {
            title: source.name,
            body: source.description ? source.description : null,
            // Passing new Field to retreive repositroy info to add ticket to that repo
            collection_id: source.collections[0] as string
        };



        if (source.assigned_to && source.assigned_to.length > 0) {
            const data = await this.utils.getAsigneeRemoteIdFromUserUuid(
                source.assigned_to[0],
            );
            if (data) {
                result.assignee = data;
            }
        }
        const tags = source.tags as string[];
        if (tags) {
            result.labels = tags;
        }

        if (source.comment) {
            const comment =
                (await this.coreUnificationService.desunify<UnifiedTicketingCommentOutput>({
                    sourceObject: source.comment,
                    targetType: TicketingObject.comment,
                    providerName: 'github',
                    vertical: 'ticketing',
                    connectionId: connectionId,
                    customFieldMappings: [],
                })) as GithubCommentInput;
            result.comment = comment;
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
        source: GithubTicketOutput | GithubTicketOutput[],
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
        ticket: GithubTicketOutput,
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
            opts = { ...opts, type: ticket.state === 'open' ? 'OPEN' : 'CLOSED' };
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

        if (ticket.labels) {
            const tags = await this.ingestService.ingestData<
                UnifiedTicketingTagOutput,
                GithubTagOutput
            >(
                ticket.labels.map(
                    (label) =>
                    ({
                        name: label.name,
                    } as GithubTagOutput),
                ),
                'github',
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

        if (ticket.repository) {
            const tcg_collection_id = await this.utils.getCollectionUuidFromRemoteId(
                String(ticket.repository.id),
                connectionId,
            );
            if (tcg_collection_id) {
                opts = { ...opts, collections: [tcg_collection_id] };
            }
        }

        const unifiedTicket: UnifiedTicketingTicketOutput = {
            remote_id: String(ticket.id),
            remote_data: ticket,
            name: ticket.title,
            description: ticket.body || null,
            due_date: ticket.milestone?.due_on ? new Date(ticket.milestone?.due_on) : null,
            field_mappings,
            ...opts,
        };

        return unifiedTicket;
    }
}

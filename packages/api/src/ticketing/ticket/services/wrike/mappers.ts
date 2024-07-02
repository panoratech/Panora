import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { ITicketMapper } from "@ticketing/ticket/types";
import { UnifiedTicketInput, UnifiedTicketOutput } from "@ticketing/ticket/types/model.unified";
import { WrikeTicketInput, WrikeTicketOutput } from "./types";

@Injectable()
export class WrikeTicketMapper implements ITicketMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('ticketing', 'ticket', 'wrike', this);
    }
    async desunify(
        source: UnifiedTicketInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<WrikeTicketInput> {
        const body_: any = {};

        if (source.comment.creator_type === 'user') {
            body_.author_id = await this.utils.getAsigneeRemoteIdFromUserUuid(
                source.comment.user_id,
            );
        }
        if (source.comment.attachments) {
            body_.attachments = source.comment.attachments;
        }
        const result: WrikeTicketInput = {
            type: 'discussion',
            subject: source.name,
            comment: {
                body: source.comment.body,
                ...body_,
            },
        };

        if (source.assigned_to && source.assigned_to.length > 0) {
            const res: string[] = [];
            for (const assignee of source.assigned_to) {
                const data = await this.utils.getAsigneeRemoteIdFromUserUuid(assignee);
                if (data) {
                    res.push(data);
                }
            }
            result.teammate_ids = res;
        }

        if (source.tags) {
            result.tags = source.tags;
        }

        if (customFieldMappings && source.field_mappings) {
            for (const [k, v] of Object.entries(source.field_mappings)) {
                const mapping = customFieldMappings.find(
                    (mapping) => mapping.slug === k,
                );
                if (mapping) {
                    result[mapping.remote_id] = v;
                }
            }
        }

        return result;
    }

    async unify(
        source: WrikeTicketOutput | WrikeTicketOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
        const sourcesArray = Array.isArray(source) ? source : [source];

        return Promise.all(
            sourcesArray.map((ticket) =>
                this.mapSingleTicketToUnified(ticket, customFieldMappings),
            ),
        );
    }

    private async mapSingleTicketToUnified(
        ticket: WrikeTicketOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedTicketOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = ticket.custom_fields[mapping.remote_id];
            }
        }

        let opts: any;

        if (ticket.assignee) {
            const user_id = await this.utils.getUserUuidFromRemoteId(
                String(ticket.assignee.id),
                'wrike',
            );
            if (user_id) {
                opts = { assigned_to: [user_id] };
            }
        }

        const unifiedTicket: UnifiedTicketOutput = {
            remote_id: ticket.id,
            name: ticket.subject,
            status: ticket.status,
            description: ticket.subject,
            due_date: new Date(ticket.created_at),
            tags: ticket.tags?.map((tag) => tag.name),
            field_mappings: field_mappings,
            ...opts,
        };

        return unifiedTicket;
    }
}
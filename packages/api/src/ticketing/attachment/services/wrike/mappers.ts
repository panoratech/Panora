import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { IAttachmentMapper } from "@ticketing/attachment/types";
import { UnifiedAttachmentInput, UnifiedAttachmentOutput } from "@ticketing/attachment/types/model.unified";
import { WrikeAttachmentOutput } from "./types";

@Injectable()
export class WrikeAttachmentMapper implements IAttachmentMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService(
            'ticketing',
            'attachment',
            'wrike',
            this,
        );
    }
    async desunify(
        source: UnifiedAttachmentInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<any> {
        return;
    }

    unify(
        source: WrikeAttachmentOutput | WrikeAttachmentOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedAttachmentOutput | UnifiedAttachmentOutput[] {
        if (!Array.isArray(source)) {
            return this.mapSingleAttachmentToUnified(source, customFieldMappings);
        }
        return source.map((attachment) =>
            this.mapSingleAttachmentToUnified(attachment, customFieldMappings),
        );
    }

    private mapSingleAttachmentToUnified(
        attachment: WrikeAttachmentOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedAttachmentOutput {
        return {
            remote_id: attachment.id,
            file_name: attachment.filename,
            file_url: attachment.url,
        };
    }
}

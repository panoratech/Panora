/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type UnifiedTeamOutputFieldMappings = {};

export type UnifiedTeamOutputRemoteData = {};

export type UnifiedTeamOutput = {
    /**
     * The name of the team
     */
    name: string;
    /**
     * The description of the team
     */
    description?: string | undefined;
    fieldMappings: UnifiedTeamOutputFieldMappings;
    /**
     * The uuid of the team
     */
    id?: string | undefined;
    /**
     * The id of the team in the context of the 3rd Party
     */
    remoteId?: string | undefined;
    remoteData: UnifiedTeamOutputRemoteData;
};

/** @internal */
export namespace UnifiedTeamOutputFieldMappings$ {
    export const inboundSchema: z.ZodType<UnifiedTeamOutputFieldMappings, z.ZodTypeDef, unknown> =
        z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedTeamOutputFieldMappings> =
        z.object({});
}

/** @internal */
export namespace UnifiedTeamOutputRemoteData$ {
    export const inboundSchema: z.ZodType<UnifiedTeamOutputRemoteData, z.ZodTypeDef, unknown> =
        z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedTeamOutputRemoteData> =
        z.object({});
}

/** @internal */
export namespace UnifiedTeamOutput$ {
    export const inboundSchema: z.ZodType<UnifiedTeamOutput, z.ZodTypeDef, unknown> = z
        .object({
            name: z.string(),
            description: z.string().optional(),
            field_mappings: z.lazy(() => UnifiedTeamOutputFieldMappings$.inboundSchema),
            id: z.string().optional(),
            remote_id: z.string().optional(),
            remote_data: z.lazy(() => UnifiedTeamOutputRemoteData$.inboundSchema),
        })
        .transform((v) => {
            return remap$(v, {
                field_mappings: "fieldMappings",
                remote_id: "remoteId",
                remote_data: "remoteData",
            });
        });

    export type Outbound = {
        name: string;
        description?: string | undefined;
        field_mappings: UnifiedTeamOutputFieldMappings$.Outbound;
        id?: string | undefined;
        remote_id?: string | undefined;
        remote_data: UnifiedTeamOutputRemoteData$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedTeamOutput> = z
        .object({
            name: z.string(),
            description: z.string().optional(),
            fieldMappings: z.lazy(() => UnifiedTeamOutputFieldMappings$.outboundSchema),
            id: z.string().optional(),
            remoteId: z.string().optional(),
            remoteData: z.lazy(() => UnifiedTeamOutputRemoteData$.outboundSchema),
        })
        .transform((v) => {
            return remap$(v, {
                fieldMappings: "field_mappings",
                remoteId: "remote_id",
                remoteData: "remote_data",
            });
        });
}

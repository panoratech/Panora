/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type UnifiedStageOutputFieldMappings = {};

export type UnifiedStageOutputRemoteData = {};

export type UnifiedStageOutput = {
    /**
     * The name of the stage
     */
    stageName: string;
    fieldMappings: UnifiedStageOutputFieldMappings;
    /**
     * The uuid of the stage
     */
    id?: string | undefined;
    /**
     * The id of the stage in the context of the Crm 3rd Party
     */
    remoteId?: string | undefined;
    remoteData: UnifiedStageOutputRemoteData;
};

/** @internal */
export namespace UnifiedStageOutputFieldMappings$ {
    export const inboundSchema: z.ZodType<UnifiedStageOutputFieldMappings, z.ZodTypeDef, unknown> =
        z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<
        Outbound,
        z.ZodTypeDef,
        UnifiedStageOutputFieldMappings
    > = z.object({});
}

/** @internal */
export namespace UnifiedStageOutputRemoteData$ {
    export const inboundSchema: z.ZodType<UnifiedStageOutputRemoteData, z.ZodTypeDef, unknown> =
        z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedStageOutputRemoteData> =
        z.object({});
}

/** @internal */
export namespace UnifiedStageOutput$ {
    export const inboundSchema: z.ZodType<UnifiedStageOutput, z.ZodTypeDef, unknown> = z
        .object({
            stage_name: z.string(),
            field_mappings: z.lazy(() => UnifiedStageOutputFieldMappings$.inboundSchema),
            id: z.string().optional(),
            remote_id: z.string().optional(),
            remote_data: z.lazy(() => UnifiedStageOutputRemoteData$.inboundSchema),
        })
        .transform((v) => {
            return remap$(v, {
                stage_name: "stageName",
                field_mappings: "fieldMappings",
                remote_id: "remoteId",
                remote_data: "remoteData",
            });
        });

    export type Outbound = {
        stage_name: string;
        field_mappings: UnifiedStageOutputFieldMappings$.Outbound;
        id?: string | undefined;
        remote_id?: string | undefined;
        remote_data: UnifiedStageOutputRemoteData$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedStageOutput> = z
        .object({
            stageName: z.string(),
            fieldMappings: z.lazy(() => UnifiedStageOutputFieldMappings$.outboundSchema),
            id: z.string().optional(),
            remoteId: z.string().optional(),
            remoteData: z.lazy(() => UnifiedStageOutputRemoteData$.outboundSchema),
        })
        .transform((v) => {
            return remap$(v, {
                stageName: "stage_name",
                fieldMappings: "field_mappings",
                remoteId: "remote_id",
                remoteData: "remote_data",
            });
        });
}

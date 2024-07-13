/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type UnifiedAttachmentOutputFieldMappings = {};

export type UnifiedAttachmentOutputRemoteData = {};

export type UnifiedAttachmentOutput = {
    /**
     * The file name of the attachment
     */
    fileName: string;
    /**
     * The file url of the attachment
     */
    fileUrl: string;
    /**
     * The uploader's uuid of the attachment
     */
    uploader: string;
    fieldMappings: UnifiedAttachmentOutputFieldMappings;
    /**
     * The uuid of the attachment
     */
    id?: string | undefined;
    /**
     * The id of the attachment in the context of the 3rd Party
     */
    remoteId?: string | undefined;
    remoteData: UnifiedAttachmentOutputRemoteData;
};

/** @internal */
export const UnifiedAttachmentOutputFieldMappings$inboundSchema: z.ZodType<
    UnifiedAttachmentOutputFieldMappings,
    z.ZodTypeDef,
    unknown
> = z.object({});

/** @internal */
export type UnifiedAttachmentOutputFieldMappings$Outbound = {};

/** @internal */
export const UnifiedAttachmentOutputFieldMappings$outboundSchema: z.ZodType<
    UnifiedAttachmentOutputFieldMappings$Outbound,
    z.ZodTypeDef,
    UnifiedAttachmentOutputFieldMappings
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedAttachmentOutputFieldMappings$ {
    /** @deprecated use `UnifiedAttachmentOutputFieldMappings$inboundSchema` instead. */
    export const inboundSchema = UnifiedAttachmentOutputFieldMappings$inboundSchema;
    /** @deprecated use `UnifiedAttachmentOutputFieldMappings$outboundSchema` instead. */
    export const outboundSchema = UnifiedAttachmentOutputFieldMappings$outboundSchema;
    /** @deprecated use `UnifiedAttachmentOutputFieldMappings$Outbound` instead. */
    export type Outbound = UnifiedAttachmentOutputFieldMappings$Outbound;
}

/** @internal */
export const UnifiedAttachmentOutputRemoteData$inboundSchema: z.ZodType<
    UnifiedAttachmentOutputRemoteData,
    z.ZodTypeDef,
    unknown
> = z.object({});

/** @internal */
export type UnifiedAttachmentOutputRemoteData$Outbound = {};

/** @internal */
export const UnifiedAttachmentOutputRemoteData$outboundSchema: z.ZodType<
    UnifiedAttachmentOutputRemoteData$Outbound,
    z.ZodTypeDef,
    UnifiedAttachmentOutputRemoteData
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedAttachmentOutputRemoteData$ {
    /** @deprecated use `UnifiedAttachmentOutputRemoteData$inboundSchema` instead. */
    export const inboundSchema = UnifiedAttachmentOutputRemoteData$inboundSchema;
    /** @deprecated use `UnifiedAttachmentOutputRemoteData$outboundSchema` instead. */
    export const outboundSchema = UnifiedAttachmentOutputRemoteData$outboundSchema;
    /** @deprecated use `UnifiedAttachmentOutputRemoteData$Outbound` instead. */
    export type Outbound = UnifiedAttachmentOutputRemoteData$Outbound;
}

/** @internal */
export const UnifiedAttachmentOutput$inboundSchema: z.ZodType<
    UnifiedAttachmentOutput,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        file_name: z.string(),
        file_url: z.string(),
        uploader: z.string(),
        field_mappings: z.lazy(() => UnifiedAttachmentOutputFieldMappings$inboundSchema),
        id: z.string().optional(),
        remote_id: z.string().optional(),
        remote_data: z.lazy(() => UnifiedAttachmentOutputRemoteData$inboundSchema),
    })
    .transform((v) => {
        return remap$(v, {
            file_name: "fileName",
            file_url: "fileUrl",
            field_mappings: "fieldMappings",
            remote_id: "remoteId",
            remote_data: "remoteData",
        });
    });

/** @internal */
export type UnifiedAttachmentOutput$Outbound = {
    file_name: string;
    file_url: string;
    uploader: string;
    field_mappings: UnifiedAttachmentOutputFieldMappings$Outbound;
    id?: string | undefined;
    remote_id?: string | undefined;
    remote_data: UnifiedAttachmentOutputRemoteData$Outbound;
};

/** @internal */
export const UnifiedAttachmentOutput$outboundSchema: z.ZodType<
    UnifiedAttachmentOutput$Outbound,
    z.ZodTypeDef,
    UnifiedAttachmentOutput
> = z
    .object({
        fileName: z.string(),
        fileUrl: z.string(),
        uploader: z.string(),
        fieldMappings: z.lazy(() => UnifiedAttachmentOutputFieldMappings$outboundSchema),
        id: z.string().optional(),
        remoteId: z.string().optional(),
        remoteData: z.lazy(() => UnifiedAttachmentOutputRemoteData$outboundSchema),
    })
    .transform((v) => {
        return remap$(v, {
            fileName: "file_name",
            fileUrl: "file_url",
            fieldMappings: "field_mappings",
            remoteId: "remote_id",
            remoteData: "remote_data",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedAttachmentOutput$ {
    /** @deprecated use `UnifiedAttachmentOutput$inboundSchema` instead. */
    export const inboundSchema = UnifiedAttachmentOutput$inboundSchema;
    /** @deprecated use `UnifiedAttachmentOutput$outboundSchema` instead. */
    export const outboundSchema = UnifiedAttachmentOutput$outboundSchema;
    /** @deprecated use `UnifiedAttachmentOutput$Outbound` instead. */
    export type Outbound = UnifiedAttachmentOutput$Outbound;
}

/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddFolderRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Filestorage software.
     */
    remoteData?: boolean | undefined;
    unifiedFolderInput: components.UnifiedFolderInput;
};

export type AddFolderResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedFolderOutput | undefined;
};

export type AddFolderResponse = components.UnifiedFolderOutput | AddFolderResponseBody;

/** @internal */
export const AddFolderRequest$inboundSchema: z.ZodType<AddFolderRequest, z.ZodTypeDef, unknown> = z
    .object({
        "x-connection-token": z.string(),
        remote_data: z.boolean().optional(),
        UnifiedFolderInput: components.UnifiedFolderInput$inboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            "x-connection-token": "xConnectionToken",
            remote_data: "remoteData",
            UnifiedFolderInput: "unifiedFolderInput",
        });
    });

/** @internal */
export type AddFolderRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
    UnifiedFolderInput: components.UnifiedFolderInput$Outbound;
};

/** @internal */
export const AddFolderRequest$outboundSchema: z.ZodType<
    AddFolderRequest$Outbound,
    z.ZodTypeDef,
    AddFolderRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
        unifiedFolderInput: components.UnifiedFolderInput$outboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            xConnectionToken: "x-connection-token",
            remoteData: "remote_data",
            unifiedFolderInput: "UnifiedFolderInput",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddFolderRequest$ {
    /** @deprecated use `AddFolderRequest$inboundSchema` instead. */
    export const inboundSchema = AddFolderRequest$inboundSchema;
    /** @deprecated use `AddFolderRequest$outboundSchema` instead. */
    export const outboundSchema = AddFolderRequest$outboundSchema;
    /** @deprecated use `AddFolderRequest$Outbound` instead. */
    export type Outbound = AddFolderRequest$Outbound;
}

/** @internal */
export const AddFolderResponseBody$inboundSchema: z.ZodType<
    AddFolderResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedFolderOutput$inboundSchema.optional(),
});

/** @internal */
export type AddFolderResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedFolderOutput$Outbound | undefined;
};

/** @internal */
export const AddFolderResponseBody$outboundSchema: z.ZodType<
    AddFolderResponseBody$Outbound,
    z.ZodTypeDef,
    AddFolderResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedFolderOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddFolderResponseBody$ {
    /** @deprecated use `AddFolderResponseBody$inboundSchema` instead. */
    export const inboundSchema = AddFolderResponseBody$inboundSchema;
    /** @deprecated use `AddFolderResponseBody$outboundSchema` instead. */
    export const outboundSchema = AddFolderResponseBody$outboundSchema;
    /** @deprecated use `AddFolderResponseBody$Outbound` instead. */
    export type Outbound = AddFolderResponseBody$Outbound;
}

/** @internal */
export const AddFolderResponse$inboundSchema: z.ZodType<AddFolderResponse, z.ZodTypeDef, unknown> =
    z.union([
        components.UnifiedFolderOutput$inboundSchema,
        z.lazy(() => AddFolderResponseBody$inboundSchema),
    ]);

/** @internal */
export type AddFolderResponse$Outbound =
    | components.UnifiedFolderOutput$Outbound
    | AddFolderResponseBody$Outbound;

/** @internal */
export const AddFolderResponse$outboundSchema: z.ZodType<
    AddFolderResponse$Outbound,
    z.ZodTypeDef,
    AddFolderResponse
> = z.union([
    components.UnifiedFolderOutput$outboundSchema,
    z.lazy(() => AddFolderResponseBody$outboundSchema),
]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddFolderResponse$ {
    /** @deprecated use `AddFolderResponse$inboundSchema` instead. */
    export const inboundSchema = AddFolderResponse$inboundSchema;
    /** @deprecated use `AddFolderResponse$outboundSchema` instead. */
    export const outboundSchema = AddFolderResponse$outboundSchema;
    /** @deprecated use `AddFolderResponse$Outbound` instead. */
    export type Outbound = AddFolderResponse$Outbound;
}

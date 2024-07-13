/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddNoteRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Crm software.
     */
    remoteData?: boolean | undefined;
    unifiedNoteInput: components.UnifiedNoteInput;
};

export type AddNoteResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedNoteOutput | undefined;
};

export type AddNoteResponse = AddNoteResponseBody | components.UnifiedNoteOutput;

/** @internal */
export const AddNoteRequest$inboundSchema: z.ZodType<AddNoteRequest, z.ZodTypeDef, unknown> = z
    .object({
        "x-connection-token": z.string(),
        remote_data: z.boolean().optional(),
        UnifiedNoteInput: components.UnifiedNoteInput$inboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            "x-connection-token": "xConnectionToken",
            remote_data: "remoteData",
            UnifiedNoteInput: "unifiedNoteInput",
        });
    });

/** @internal */
export type AddNoteRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
    UnifiedNoteInput: components.UnifiedNoteInput$Outbound;
};

/** @internal */
export const AddNoteRequest$outboundSchema: z.ZodType<
    AddNoteRequest$Outbound,
    z.ZodTypeDef,
    AddNoteRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
        unifiedNoteInput: components.UnifiedNoteInput$outboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            xConnectionToken: "x-connection-token",
            remoteData: "remote_data",
            unifiedNoteInput: "UnifiedNoteInput",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddNoteRequest$ {
    /** @deprecated use `AddNoteRequest$inboundSchema` instead. */
    export const inboundSchema = AddNoteRequest$inboundSchema;
    /** @deprecated use `AddNoteRequest$outboundSchema` instead. */
    export const outboundSchema = AddNoteRequest$outboundSchema;
    /** @deprecated use `AddNoteRequest$Outbound` instead. */
    export type Outbound = AddNoteRequest$Outbound;
}

/** @internal */
export const AddNoteResponseBody$inboundSchema: z.ZodType<
    AddNoteResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedNoteOutput$inboundSchema.optional(),
});

/** @internal */
export type AddNoteResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedNoteOutput$Outbound | undefined;
};

/** @internal */
export const AddNoteResponseBody$outboundSchema: z.ZodType<
    AddNoteResponseBody$Outbound,
    z.ZodTypeDef,
    AddNoteResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedNoteOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddNoteResponseBody$ {
    /** @deprecated use `AddNoteResponseBody$inboundSchema` instead. */
    export const inboundSchema = AddNoteResponseBody$inboundSchema;
    /** @deprecated use `AddNoteResponseBody$outboundSchema` instead. */
    export const outboundSchema = AddNoteResponseBody$outboundSchema;
    /** @deprecated use `AddNoteResponseBody$Outbound` instead. */
    export type Outbound = AddNoteResponseBody$Outbound;
}

/** @internal */
export const AddNoteResponse$inboundSchema: z.ZodType<AddNoteResponse, z.ZodTypeDef, unknown> =
    z.union([
        z.lazy(() => AddNoteResponseBody$inboundSchema),
        components.UnifiedNoteOutput$inboundSchema,
    ]);

/** @internal */
export type AddNoteResponse$Outbound =
    | AddNoteResponseBody$Outbound
    | components.UnifiedNoteOutput$Outbound;

/** @internal */
export const AddNoteResponse$outboundSchema: z.ZodType<
    AddNoteResponse$Outbound,
    z.ZodTypeDef,
    AddNoteResponse
> = z.union([
    z.lazy(() => AddNoteResponseBody$outboundSchema),
    components.UnifiedNoteOutput$outboundSchema,
]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddNoteResponse$ {
    /** @deprecated use `AddNoteResponse$inboundSchema` instead. */
    export const inboundSchema = AddNoteResponse$inboundSchema;
    /** @deprecated use `AddNoteResponse$outboundSchema` instead. */
    export const outboundSchema = AddNoteResponse$outboundSchema;
    /** @deprecated use `AddNoteResponse$Outbound` instead. */
    export type Outbound = AddNoteResponse$Outbound;
}

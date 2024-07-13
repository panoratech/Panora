/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetSharedlinksRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Filestorage software.
     */
    remoteData?: boolean | undefined;
};

export type GetSharedlinksResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedSharedLinkOutput | undefined;
};

/** @internal */
export const GetSharedlinksRequest$inboundSchema: z.ZodType<
    GetSharedlinksRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        "x-connection-token": z.string(),
        remote_data: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            "x-connection-token": "xConnectionToken",
            remote_data: "remoteData",
        });
    });

/** @internal */
export type GetSharedlinksRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetSharedlinksRequest$outboundSchema: z.ZodType<
    GetSharedlinksRequest$Outbound,
    z.ZodTypeDef,
    GetSharedlinksRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            xConnectionToken: "x-connection-token",
            remoteData: "remote_data",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetSharedlinksRequest$ {
    /** @deprecated use `GetSharedlinksRequest$inboundSchema` instead. */
    export const inboundSchema = GetSharedlinksRequest$inboundSchema;
    /** @deprecated use `GetSharedlinksRequest$outboundSchema` instead. */
    export const outboundSchema = GetSharedlinksRequest$outboundSchema;
    /** @deprecated use `GetSharedlinksRequest$Outbound` instead. */
    export type Outbound = GetSharedlinksRequest$Outbound;
}

/** @internal */
export const GetSharedlinksResponseBody$inboundSchema: z.ZodType<
    GetSharedlinksResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedSharedLinkOutput$inboundSchema.optional(),
});

/** @internal */
export type GetSharedlinksResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedSharedLinkOutput$Outbound | undefined;
};

/** @internal */
export const GetSharedlinksResponseBody$outboundSchema: z.ZodType<
    GetSharedlinksResponseBody$Outbound,
    z.ZodTypeDef,
    GetSharedlinksResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedSharedLinkOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetSharedlinksResponseBody$ {
    /** @deprecated use `GetSharedlinksResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetSharedlinksResponseBody$inboundSchema;
    /** @deprecated use `GetSharedlinksResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetSharedlinksResponseBody$outboundSchema;
    /** @deprecated use `GetSharedlinksResponseBody$Outbound` instead. */
    export type Outbound = GetSharedlinksResponseBody$Outbound;
}

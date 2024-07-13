/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetDependentsRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Hris software.
     */
    remoteData?: boolean | undefined;
};

export type GetDependentsResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedDependentOutput | undefined;
};

/** @internal */
export const GetDependentsRequest$inboundSchema: z.ZodType<
    GetDependentsRequest,
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
export type GetDependentsRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetDependentsRequest$outboundSchema: z.ZodType<
    GetDependentsRequest$Outbound,
    z.ZodTypeDef,
    GetDependentsRequest
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
export namespace GetDependentsRequest$ {
    /** @deprecated use `GetDependentsRequest$inboundSchema` instead. */
    export const inboundSchema = GetDependentsRequest$inboundSchema;
    /** @deprecated use `GetDependentsRequest$outboundSchema` instead. */
    export const outboundSchema = GetDependentsRequest$outboundSchema;
    /** @deprecated use `GetDependentsRequest$Outbound` instead. */
    export type Outbound = GetDependentsRequest$Outbound;
}

/** @internal */
export const GetDependentsResponseBody$inboundSchema: z.ZodType<
    GetDependentsResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedDependentOutput$inboundSchema.optional(),
});

/** @internal */
export type GetDependentsResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedDependentOutput$Outbound | undefined;
};

/** @internal */
export const GetDependentsResponseBody$outboundSchema: z.ZodType<
    GetDependentsResponseBody$Outbound,
    z.ZodTypeDef,
    GetDependentsResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedDependentOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetDependentsResponseBody$ {
    /** @deprecated use `GetDependentsResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetDependentsResponseBody$inboundSchema;
    /** @deprecated use `GetDependentsResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetDependentsResponseBody$outboundSchema;
    /** @deprecated use `GetDependentsResponseBody$Outbound` instead. */
    export type Outbound = GetDependentsResponseBody$Outbound;
}

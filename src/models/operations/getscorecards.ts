/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetScoreCardsRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Ats software.
     */
    remoteData?: boolean | undefined;
};

export type GetScoreCardsResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedScoreCardOutput | undefined;
};

/** @internal */
export const GetScoreCardsRequest$inboundSchema: z.ZodType<
    GetScoreCardsRequest,
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
export type GetScoreCardsRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetScoreCardsRequest$outboundSchema: z.ZodType<
    GetScoreCardsRequest$Outbound,
    z.ZodTypeDef,
    GetScoreCardsRequest
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
export namespace GetScoreCardsRequest$ {
    /** @deprecated use `GetScoreCardsRequest$inboundSchema` instead. */
    export const inboundSchema = GetScoreCardsRequest$inboundSchema;
    /** @deprecated use `GetScoreCardsRequest$outboundSchema` instead. */
    export const outboundSchema = GetScoreCardsRequest$outboundSchema;
    /** @deprecated use `GetScoreCardsRequest$Outbound` instead. */
    export type Outbound = GetScoreCardsRequest$Outbound;
}

/** @internal */
export const GetScoreCardsResponseBody$inboundSchema: z.ZodType<
    GetScoreCardsResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedScoreCardOutput$inboundSchema.optional(),
});

/** @internal */
export type GetScoreCardsResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedScoreCardOutput$Outbound | undefined;
};

/** @internal */
export const GetScoreCardsResponseBody$outboundSchema: z.ZodType<
    GetScoreCardsResponseBody$Outbound,
    z.ZodTypeDef,
    GetScoreCardsResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedScoreCardOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetScoreCardsResponseBody$ {
    /** @deprecated use `GetScoreCardsResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetScoreCardsResponseBody$inboundSchema;
    /** @deprecated use `GetScoreCardsResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetScoreCardsResponseBody$outboundSchema;
    /** @deprecated use `GetScoreCardsResponseBody$Outbound` instead. */
    export type Outbound = GetScoreCardsResponseBody$Outbound;
}

/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetTicketsRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original software.
     */
    remoteData?: boolean | undefined;
    /**
     * Set to get the number of records.
     */
    limit?: number | undefined;
    /**
     * Set to get the number of records after this cursor.
     */
    cursor?: string | undefined;
};

export type GetTicketsResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedTicketOutput | undefined;
};

/** @internal */
export const GetTicketsRequest$inboundSchema: z.ZodType<GetTicketsRequest, z.ZodTypeDef, unknown> =
    z
        .object({
            "x-connection-token": z.string(),
            remote_data: z.boolean().optional(),
            limit: z.number().default(50),
            cursor: z.string().optional(),
        })
        .transform((v) => {
            return remap$(v, {
                "x-connection-token": "xConnectionToken",
                remote_data: "remoteData",
            });
        });

/** @internal */
export type GetTicketsRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
    limit: number;
    cursor?: string | undefined;
};

/** @internal */
export const GetTicketsRequest$outboundSchema: z.ZodType<
    GetTicketsRequest$Outbound,
    z.ZodTypeDef,
    GetTicketsRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
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
export namespace GetTicketsRequest$ {
    /** @deprecated use `GetTicketsRequest$inboundSchema` instead. */
    export const inboundSchema = GetTicketsRequest$inboundSchema;
    /** @deprecated use `GetTicketsRequest$outboundSchema` instead. */
    export const outboundSchema = GetTicketsRequest$outboundSchema;
    /** @deprecated use `GetTicketsRequest$Outbound` instead. */
    export type Outbound = GetTicketsRequest$Outbound;
}

/** @internal */
export const GetTicketsResponseBody$inboundSchema: z.ZodType<
    GetTicketsResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedTicketOutput$inboundSchema.optional(),
});

/** @internal */
export type GetTicketsResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedTicketOutput$Outbound | undefined;
};

/** @internal */
export const GetTicketsResponseBody$outboundSchema: z.ZodType<
    GetTicketsResponseBody$Outbound,
    z.ZodTypeDef,
    GetTicketsResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedTicketOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetTicketsResponseBody$ {
    /** @deprecated use `GetTicketsResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetTicketsResponseBody$inboundSchema;
    /** @deprecated use `GetTicketsResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetTicketsResponseBody$outboundSchema;
    /** @deprecated use `GetTicketsResponseBody$Outbound` instead. */
    export type Outbound = GetTicketsResponseBody$Outbound;
}

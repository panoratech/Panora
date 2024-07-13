/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetTransactionRequest = {
    /**
     * id of the transaction you want to retrieve.
     */
    id: string;
    /**
     * Set to true to include data from the original Accounting software.
     */
    remoteData?: boolean | undefined;
};

export type GetTransactionResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedTransactionOutput | undefined;
};

/** @internal */
export const GetTransactionRequest$inboundSchema: z.ZodType<
    GetTransactionRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        id: z.string(),
        remote_data: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            remote_data: "remoteData",
        });
    });

/** @internal */
export type GetTransactionRequest$Outbound = {
    id: string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetTransactionRequest$outboundSchema: z.ZodType<
    GetTransactionRequest$Outbound,
    z.ZodTypeDef,
    GetTransactionRequest
> = z
    .object({
        id: z.string(),
        remoteData: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            remoteData: "remote_data",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetTransactionRequest$ {
    /** @deprecated use `GetTransactionRequest$inboundSchema` instead. */
    export const inboundSchema = GetTransactionRequest$inboundSchema;
    /** @deprecated use `GetTransactionRequest$outboundSchema` instead. */
    export const outboundSchema = GetTransactionRequest$outboundSchema;
    /** @deprecated use `GetTransactionRequest$Outbound` instead. */
    export type Outbound = GetTransactionRequest$Outbound;
}

/** @internal */
export const GetTransactionResponseBody$inboundSchema: z.ZodType<
    GetTransactionResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedTransactionOutput$inboundSchema.optional(),
});

/** @internal */
export type GetTransactionResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedTransactionOutput$Outbound | undefined;
};

/** @internal */
export const GetTransactionResponseBody$outboundSchema: z.ZodType<
    GetTransactionResponseBody$Outbound,
    z.ZodTypeDef,
    GetTransactionResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedTransactionOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetTransactionResponseBody$ {
    /** @deprecated use `GetTransactionResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetTransactionResponseBody$inboundSchema;
    /** @deprecated use `GetTransactionResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetTransactionResponseBody$outboundSchema;
    /** @deprecated use `GetTransactionResponseBody$Outbound` instead. */
    export type Outbound = GetTransactionResponseBody$Outbound;
}

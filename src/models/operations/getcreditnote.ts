/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetCreditNoteRequest = {
    /**
     * id of the creditnote you want to retrieve.
     */
    id: string;
    /**
     * Set to true to include data from the original Accounting software.
     */
    remoteData?: boolean | undefined;
};

export type GetCreditNoteResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedCreditNoteOutput | undefined;
};

/** @internal */
export const GetCreditNoteRequest$inboundSchema: z.ZodType<
    GetCreditNoteRequest,
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
export type GetCreditNoteRequest$Outbound = {
    id: string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetCreditNoteRequest$outboundSchema: z.ZodType<
    GetCreditNoteRequest$Outbound,
    z.ZodTypeDef,
    GetCreditNoteRequest
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
export namespace GetCreditNoteRequest$ {
    /** @deprecated use `GetCreditNoteRequest$inboundSchema` instead. */
    export const inboundSchema = GetCreditNoteRequest$inboundSchema;
    /** @deprecated use `GetCreditNoteRequest$outboundSchema` instead. */
    export const outboundSchema = GetCreditNoteRequest$outboundSchema;
    /** @deprecated use `GetCreditNoteRequest$Outbound` instead. */
    export type Outbound = GetCreditNoteRequest$Outbound;
}

/** @internal */
export const GetCreditNoteResponseBody$inboundSchema: z.ZodType<
    GetCreditNoteResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedCreditNoteOutput$inboundSchema.optional(),
});

/** @internal */
export type GetCreditNoteResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedCreditNoteOutput$Outbound | undefined;
};

/** @internal */
export const GetCreditNoteResponseBody$outboundSchema: z.ZodType<
    GetCreditNoteResponseBody$Outbound,
    z.ZodTypeDef,
    GetCreditNoteResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedCreditNoteOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetCreditNoteResponseBody$ {
    /** @deprecated use `GetCreditNoteResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetCreditNoteResponseBody$inboundSchema;
    /** @deprecated use `GetCreditNoteResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetCreditNoteResponseBody$outboundSchema;
    /** @deprecated use `GetCreditNoteResponseBody$Outbound` instead. */
    export type Outbound = GetCreditNoteResponseBody$Outbound;
}

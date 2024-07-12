/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetAccountingContactRequest = {
    /**
     * id of the contact you want to retrieve.
     */
    id: string;
    /**
     * Set to true to include data from the original Accounting software.
     */
    remoteData?: boolean | undefined;
};

export type GetAccountingContactResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedContactOutput | undefined;
};

/** @internal */
export const GetAccountingContactRequest$inboundSchema: z.ZodType<
    GetAccountingContactRequest,
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
export type GetAccountingContactRequest$Outbound = {
    id: string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetAccountingContactRequest$outboundSchema: z.ZodType<
    GetAccountingContactRequest$Outbound,
    z.ZodTypeDef,
    GetAccountingContactRequest
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
export namespace GetAccountingContactRequest$ {
    /** @deprecated use `GetAccountingContactRequest$inboundSchema` instead. */
    export const inboundSchema = GetAccountingContactRequest$inboundSchema;
    /** @deprecated use `GetAccountingContactRequest$outboundSchema` instead. */
    export const outboundSchema = GetAccountingContactRequest$outboundSchema;
    /** @deprecated use `GetAccountingContactRequest$Outbound` instead. */
    export type Outbound = GetAccountingContactRequest$Outbound;
}

/** @internal */
export const GetAccountingContactResponseBody$inboundSchema: z.ZodType<
    GetAccountingContactResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedContactOutput$inboundSchema.optional(),
});

/** @internal */
export type GetAccountingContactResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedContactOutput$Outbound | undefined;
};

/** @internal */
export const GetAccountingContactResponseBody$outboundSchema: z.ZodType<
    GetAccountingContactResponseBody$Outbound,
    z.ZodTypeDef,
    GetAccountingContactResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedContactOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetAccountingContactResponseBody$ {
    /** @deprecated use `GetAccountingContactResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetAccountingContactResponseBody$inboundSchema;
    /** @deprecated use `GetAccountingContactResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetAccountingContactResponseBody$outboundSchema;
    /** @deprecated use `GetAccountingContactResponseBody$Outbound` instead. */
    export type Outbound = GetAccountingContactResponseBody$Outbound;
}

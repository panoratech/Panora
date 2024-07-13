/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetMarketingAutomationContactRequest = {
    /**
     * id of the contact you want to retrieve.
     */
    id: string;
    /**
     * Set to true to include data from the original Marketingautomation software.
     */
    remoteData?: boolean | undefined;
};

export type GetMarketingAutomationContactResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedContactOutput | undefined;
};

/** @internal */
export const GetMarketingAutomationContactRequest$inboundSchema: z.ZodType<
    GetMarketingAutomationContactRequest,
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
export type GetMarketingAutomationContactRequest$Outbound = {
    id: string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetMarketingAutomationContactRequest$outboundSchema: z.ZodType<
    GetMarketingAutomationContactRequest$Outbound,
    z.ZodTypeDef,
    GetMarketingAutomationContactRequest
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
export namespace GetMarketingAutomationContactRequest$ {
    /** @deprecated use `GetMarketingAutomationContactRequest$inboundSchema` instead. */
    export const inboundSchema = GetMarketingAutomationContactRequest$inboundSchema;
    /** @deprecated use `GetMarketingAutomationContactRequest$outboundSchema` instead. */
    export const outboundSchema = GetMarketingAutomationContactRequest$outboundSchema;
    /** @deprecated use `GetMarketingAutomationContactRequest$Outbound` instead. */
    export type Outbound = GetMarketingAutomationContactRequest$Outbound;
}

/** @internal */
export const GetMarketingAutomationContactResponseBody$inboundSchema: z.ZodType<
    GetMarketingAutomationContactResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedContactOutput$inboundSchema.optional(),
});

/** @internal */
export type GetMarketingAutomationContactResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedContactOutput$Outbound | undefined;
};

/** @internal */
export const GetMarketingAutomationContactResponseBody$outboundSchema: z.ZodType<
    GetMarketingAutomationContactResponseBody$Outbound,
    z.ZodTypeDef,
    GetMarketingAutomationContactResponseBody
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
export namespace GetMarketingAutomationContactResponseBody$ {
    /** @deprecated use `GetMarketingAutomationContactResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetMarketingAutomationContactResponseBody$inboundSchema;
    /** @deprecated use `GetMarketingAutomationContactResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetMarketingAutomationContactResponseBody$outboundSchema;
    /** @deprecated use `GetMarketingAutomationContactResponseBody$Outbound` instead. */
    export type Outbound = GetMarketingAutomationContactResponseBody$Outbound;
}

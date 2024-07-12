/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetMarketingAutomationUsersRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Marketingautomation software.
     */
    remoteData?: boolean | undefined;
};

export type GetMarketingAutomationUsersResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedUserOutput | undefined;
};

/** @internal */
export const GetMarketingAutomationUsersRequest$inboundSchema: z.ZodType<
    GetMarketingAutomationUsersRequest,
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
export type GetMarketingAutomationUsersRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetMarketingAutomationUsersRequest$outboundSchema: z.ZodType<
    GetMarketingAutomationUsersRequest$Outbound,
    z.ZodTypeDef,
    GetMarketingAutomationUsersRequest
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
export namespace GetMarketingAutomationUsersRequest$ {
    /** @deprecated use `GetMarketingAutomationUsersRequest$inboundSchema` instead. */
    export const inboundSchema = GetMarketingAutomationUsersRequest$inboundSchema;
    /** @deprecated use `GetMarketingAutomationUsersRequest$outboundSchema` instead. */
    export const outboundSchema = GetMarketingAutomationUsersRequest$outboundSchema;
    /** @deprecated use `GetMarketingAutomationUsersRequest$Outbound` instead. */
    export type Outbound = GetMarketingAutomationUsersRequest$Outbound;
}

/** @internal */
export const GetMarketingAutomationUsersResponseBody$inboundSchema: z.ZodType<
    GetMarketingAutomationUsersResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedUserOutput$inboundSchema.optional(),
});

/** @internal */
export type GetMarketingAutomationUsersResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedUserOutput$Outbound | undefined;
};

/** @internal */
export const GetMarketingAutomationUsersResponseBody$outboundSchema: z.ZodType<
    GetMarketingAutomationUsersResponseBody$Outbound,
    z.ZodTypeDef,
    GetMarketingAutomationUsersResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedUserOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetMarketingAutomationUsersResponseBody$ {
    /** @deprecated use `GetMarketingAutomationUsersResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetMarketingAutomationUsersResponseBody$inboundSchema;
    /** @deprecated use `GetMarketingAutomationUsersResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetMarketingAutomationUsersResponseBody$outboundSchema;
    /** @deprecated use `GetMarketingAutomationUsersResponseBody$Outbound` instead. */
    export type Outbound = GetMarketingAutomationUsersResponseBody$Outbound;
}

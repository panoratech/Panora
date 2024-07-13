/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetBenefitsRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Hris software.
     */
    remoteData?: boolean | undefined;
};

export type GetBenefitsResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedBenefitOutput | undefined;
};

/** @internal */
export const GetBenefitsRequest$inboundSchema: z.ZodType<
    GetBenefitsRequest,
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
export type GetBenefitsRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetBenefitsRequest$outboundSchema: z.ZodType<
    GetBenefitsRequest$Outbound,
    z.ZodTypeDef,
    GetBenefitsRequest
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
export namespace GetBenefitsRequest$ {
    /** @deprecated use `GetBenefitsRequest$inboundSchema` instead. */
    export const inboundSchema = GetBenefitsRequest$inboundSchema;
    /** @deprecated use `GetBenefitsRequest$outboundSchema` instead. */
    export const outboundSchema = GetBenefitsRequest$outboundSchema;
    /** @deprecated use `GetBenefitsRequest$Outbound` instead. */
    export type Outbound = GetBenefitsRequest$Outbound;
}

/** @internal */
export const GetBenefitsResponseBody$inboundSchema: z.ZodType<
    GetBenefitsResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedBenefitOutput$inboundSchema.optional(),
});

/** @internal */
export type GetBenefitsResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedBenefitOutput$Outbound | undefined;
};

/** @internal */
export const GetBenefitsResponseBody$outboundSchema: z.ZodType<
    GetBenefitsResponseBody$Outbound,
    z.ZodTypeDef,
    GetBenefitsResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedBenefitOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetBenefitsResponseBody$ {
    /** @deprecated use `GetBenefitsResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetBenefitsResponseBody$inboundSchema;
    /** @deprecated use `GetBenefitsResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetBenefitsResponseBody$outboundSchema;
    /** @deprecated use `GetBenefitsResponseBody$Outbound` instead. */
    export type Outbound = GetBenefitsResponseBody$Outbound;
}

/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetOffersRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Ats software.
     */
    remoteData?: boolean | undefined;
};

export type GetOffersResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedOfferOutput | undefined;
};

/** @internal */
export const GetOffersRequest$inboundSchema: z.ZodType<GetOffersRequest, z.ZodTypeDef, unknown> = z
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
export type GetOffersRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetOffersRequest$outboundSchema: z.ZodType<
    GetOffersRequest$Outbound,
    z.ZodTypeDef,
    GetOffersRequest
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
export namespace GetOffersRequest$ {
    /** @deprecated use `GetOffersRequest$inboundSchema` instead. */
    export const inboundSchema = GetOffersRequest$inboundSchema;
    /** @deprecated use `GetOffersRequest$outboundSchema` instead. */
    export const outboundSchema = GetOffersRequest$outboundSchema;
    /** @deprecated use `GetOffersRequest$Outbound` instead. */
    export type Outbound = GetOffersRequest$Outbound;
}

/** @internal */
export const GetOffersResponseBody$inboundSchema: z.ZodType<
    GetOffersResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedOfferOutput$inboundSchema.optional(),
});

/** @internal */
export type GetOffersResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedOfferOutput$Outbound | undefined;
};

/** @internal */
export const GetOffersResponseBody$outboundSchema: z.ZodType<
    GetOffersResponseBody$Outbound,
    z.ZodTypeDef,
    GetOffersResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedOfferOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetOffersResponseBody$ {
    /** @deprecated use `GetOffersResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetOffersResponseBody$inboundSchema;
    /** @deprecated use `GetOffersResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetOffersResponseBody$outboundSchema;
    /** @deprecated use `GetOffersResponseBody$Outbound` instead. */
    export type Outbound = GetOffersResponseBody$Outbound;
}

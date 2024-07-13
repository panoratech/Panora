/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddRejectReasonRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Ats software.
     */
    remoteData?: boolean | undefined;
    unifiedRejectReasonInput: components.UnifiedRejectReasonInput;
};

export type AddRejectReasonResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedRejectReasonOutput | undefined;
};

export type AddRejectReasonResponse =
    | components.UnifiedRejectReasonOutput
    | AddRejectReasonResponseBody;

/** @internal */
export const AddRejectReasonRequest$inboundSchema: z.ZodType<
    AddRejectReasonRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        "x-connection-token": z.string(),
        remote_data: z.boolean().optional(),
        UnifiedRejectReasonInput: components.UnifiedRejectReasonInput$inboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            "x-connection-token": "xConnectionToken",
            remote_data: "remoteData",
            UnifiedRejectReasonInput: "unifiedRejectReasonInput",
        });
    });

/** @internal */
export type AddRejectReasonRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
    UnifiedRejectReasonInput: components.UnifiedRejectReasonInput$Outbound;
};

/** @internal */
export const AddRejectReasonRequest$outboundSchema: z.ZodType<
    AddRejectReasonRequest$Outbound,
    z.ZodTypeDef,
    AddRejectReasonRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
        unifiedRejectReasonInput: components.UnifiedRejectReasonInput$outboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            xConnectionToken: "x-connection-token",
            remoteData: "remote_data",
            unifiedRejectReasonInput: "UnifiedRejectReasonInput",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddRejectReasonRequest$ {
    /** @deprecated use `AddRejectReasonRequest$inboundSchema` instead. */
    export const inboundSchema = AddRejectReasonRequest$inboundSchema;
    /** @deprecated use `AddRejectReasonRequest$outboundSchema` instead. */
    export const outboundSchema = AddRejectReasonRequest$outboundSchema;
    /** @deprecated use `AddRejectReasonRequest$Outbound` instead. */
    export type Outbound = AddRejectReasonRequest$Outbound;
}

/** @internal */
export const AddRejectReasonResponseBody$inboundSchema: z.ZodType<
    AddRejectReasonResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedRejectReasonOutput$inboundSchema.optional(),
});

/** @internal */
export type AddRejectReasonResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedRejectReasonOutput$Outbound | undefined;
};

/** @internal */
export const AddRejectReasonResponseBody$outboundSchema: z.ZodType<
    AddRejectReasonResponseBody$Outbound,
    z.ZodTypeDef,
    AddRejectReasonResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedRejectReasonOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddRejectReasonResponseBody$ {
    /** @deprecated use `AddRejectReasonResponseBody$inboundSchema` instead. */
    export const inboundSchema = AddRejectReasonResponseBody$inboundSchema;
    /** @deprecated use `AddRejectReasonResponseBody$outboundSchema` instead. */
    export const outboundSchema = AddRejectReasonResponseBody$outboundSchema;
    /** @deprecated use `AddRejectReasonResponseBody$Outbound` instead. */
    export type Outbound = AddRejectReasonResponseBody$Outbound;
}

/** @internal */
export const AddRejectReasonResponse$inboundSchema: z.ZodType<
    AddRejectReasonResponse,
    z.ZodTypeDef,
    unknown
> = z.union([
    components.UnifiedRejectReasonOutput$inboundSchema,
    z.lazy(() => AddRejectReasonResponseBody$inboundSchema),
]);

/** @internal */
export type AddRejectReasonResponse$Outbound =
    | components.UnifiedRejectReasonOutput$Outbound
    | AddRejectReasonResponseBody$Outbound;

/** @internal */
export const AddRejectReasonResponse$outboundSchema: z.ZodType<
    AddRejectReasonResponse$Outbound,
    z.ZodTypeDef,
    AddRejectReasonResponse
> = z.union([
    components.UnifiedRejectReasonOutput$outboundSchema,
    z.lazy(() => AddRejectReasonResponseBody$outboundSchema),
]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddRejectReasonResponse$ {
    /** @deprecated use `AddRejectReasonResponse$inboundSchema` instead. */
    export const inboundSchema = AddRejectReasonResponse$inboundSchema;
    /** @deprecated use `AddRejectReasonResponse$outboundSchema` instead. */
    export const outboundSchema = AddRejectReasonResponse$outboundSchema;
    /** @deprecated use `AddRejectReasonResponse$Outbound` instead. */
    export type Outbound = AddRejectReasonResponse$Outbound;
}

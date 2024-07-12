/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddCashflowStatementRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Accounting software.
     */
    remoteData?: boolean | undefined;
    unifiedCashflowStatementInput: components.UnifiedCashflowStatementInput;
};

export type AddCashflowStatementResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedCashflowStatementOutput | undefined;
};

export type AddCashflowStatementResponse =
    | components.UnifiedCashflowStatementOutput
    | AddCashflowStatementResponseBody;

/** @internal */
export const AddCashflowStatementRequest$inboundSchema: z.ZodType<
    AddCashflowStatementRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        "x-connection-token": z.string(),
        remote_data: z.boolean().optional(),
        UnifiedCashflowStatementInput: components.UnifiedCashflowStatementInput$inboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            "x-connection-token": "xConnectionToken",
            remote_data: "remoteData",
            UnifiedCashflowStatementInput: "unifiedCashflowStatementInput",
        });
    });

/** @internal */
export type AddCashflowStatementRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
    UnifiedCashflowStatementInput: components.UnifiedCashflowStatementInput$Outbound;
};

/** @internal */
export const AddCashflowStatementRequest$outboundSchema: z.ZodType<
    AddCashflowStatementRequest$Outbound,
    z.ZodTypeDef,
    AddCashflowStatementRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
        unifiedCashflowStatementInput: components.UnifiedCashflowStatementInput$outboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            xConnectionToken: "x-connection-token",
            remoteData: "remote_data",
            unifiedCashflowStatementInput: "UnifiedCashflowStatementInput",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddCashflowStatementRequest$ {
    /** @deprecated use `AddCashflowStatementRequest$inboundSchema` instead. */
    export const inboundSchema = AddCashflowStatementRequest$inboundSchema;
    /** @deprecated use `AddCashflowStatementRequest$outboundSchema` instead. */
    export const outboundSchema = AddCashflowStatementRequest$outboundSchema;
    /** @deprecated use `AddCashflowStatementRequest$Outbound` instead. */
    export type Outbound = AddCashflowStatementRequest$Outbound;
}

/** @internal */
export const AddCashflowStatementResponseBody$inboundSchema: z.ZodType<
    AddCashflowStatementResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedCashflowStatementOutput$inboundSchema.optional(),
});

/** @internal */
export type AddCashflowStatementResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedCashflowStatementOutput$Outbound | undefined;
};

/** @internal */
export const AddCashflowStatementResponseBody$outboundSchema: z.ZodType<
    AddCashflowStatementResponseBody$Outbound,
    z.ZodTypeDef,
    AddCashflowStatementResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedCashflowStatementOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddCashflowStatementResponseBody$ {
    /** @deprecated use `AddCashflowStatementResponseBody$inboundSchema` instead. */
    export const inboundSchema = AddCashflowStatementResponseBody$inboundSchema;
    /** @deprecated use `AddCashflowStatementResponseBody$outboundSchema` instead. */
    export const outboundSchema = AddCashflowStatementResponseBody$outboundSchema;
    /** @deprecated use `AddCashflowStatementResponseBody$Outbound` instead. */
    export type Outbound = AddCashflowStatementResponseBody$Outbound;
}

/** @internal */
export const AddCashflowStatementResponse$inboundSchema: z.ZodType<
    AddCashflowStatementResponse,
    z.ZodTypeDef,
    unknown
> = z.union([
    components.UnifiedCashflowStatementOutput$inboundSchema,
    z.lazy(() => AddCashflowStatementResponseBody$inboundSchema),
]);

/** @internal */
export type AddCashflowStatementResponse$Outbound =
    | components.UnifiedCashflowStatementOutput$Outbound
    | AddCashflowStatementResponseBody$Outbound;

/** @internal */
export const AddCashflowStatementResponse$outboundSchema: z.ZodType<
    AddCashflowStatementResponse$Outbound,
    z.ZodTypeDef,
    AddCashflowStatementResponse
> = z.union([
    components.UnifiedCashflowStatementOutput$outboundSchema,
    z.lazy(() => AddCashflowStatementResponseBody$outboundSchema),
]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddCashflowStatementResponse$ {
    /** @deprecated use `AddCashflowStatementResponse$inboundSchema` instead. */
    export const inboundSchema = AddCashflowStatementResponse$inboundSchema;
    /** @deprecated use `AddCashflowStatementResponse$outboundSchema` instead. */
    export const outboundSchema = AddCashflowStatementResponse$outboundSchema;
    /** @deprecated use `AddCashflowStatementResponse$Outbound` instead. */
    export type Outbound = AddCashflowStatementResponse$Outbound;
}

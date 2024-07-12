/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddBalanceSheetRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Accounting software.
     */
    remoteData?: boolean | undefined;
    unifiedBalanceSheetInput: components.UnifiedBalanceSheetInput;
};

export type AddBalanceSheetResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedBalanceSheetOutput | undefined;
};

export type AddBalanceSheetResponse =
    | components.UnifiedBalanceSheetOutput
    | AddBalanceSheetResponseBody;

/** @internal */
export const AddBalanceSheetRequest$inboundSchema: z.ZodType<
    AddBalanceSheetRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        "x-connection-token": z.string(),
        remote_data: z.boolean().optional(),
        UnifiedBalanceSheetInput: components.UnifiedBalanceSheetInput$inboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            "x-connection-token": "xConnectionToken",
            remote_data: "remoteData",
            UnifiedBalanceSheetInput: "unifiedBalanceSheetInput",
        });
    });

/** @internal */
export type AddBalanceSheetRequest$Outbound = {
    "x-connection-token": string;
    remote_data?: boolean | undefined;
    UnifiedBalanceSheetInput: components.UnifiedBalanceSheetInput$Outbound;
};

/** @internal */
export const AddBalanceSheetRequest$outboundSchema: z.ZodType<
    AddBalanceSheetRequest$Outbound,
    z.ZodTypeDef,
    AddBalanceSheetRequest
> = z
    .object({
        xConnectionToken: z.string(),
        remoteData: z.boolean().optional(),
        unifiedBalanceSheetInput: components.UnifiedBalanceSheetInput$outboundSchema,
    })
    .transform((v) => {
        return remap$(v, {
            xConnectionToken: "x-connection-token",
            remoteData: "remote_data",
            unifiedBalanceSheetInput: "UnifiedBalanceSheetInput",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddBalanceSheetRequest$ {
    /** @deprecated use `AddBalanceSheetRequest$inboundSchema` instead. */
    export const inboundSchema = AddBalanceSheetRequest$inboundSchema;
    /** @deprecated use `AddBalanceSheetRequest$outboundSchema` instead. */
    export const outboundSchema = AddBalanceSheetRequest$outboundSchema;
    /** @deprecated use `AddBalanceSheetRequest$Outbound` instead. */
    export type Outbound = AddBalanceSheetRequest$Outbound;
}

/** @internal */
export const AddBalanceSheetResponseBody$inboundSchema: z.ZodType<
    AddBalanceSheetResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedBalanceSheetOutput$inboundSchema.optional(),
});

/** @internal */
export type AddBalanceSheetResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedBalanceSheetOutput$Outbound | undefined;
};

/** @internal */
export const AddBalanceSheetResponseBody$outboundSchema: z.ZodType<
    AddBalanceSheetResponseBody$Outbound,
    z.ZodTypeDef,
    AddBalanceSheetResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedBalanceSheetOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddBalanceSheetResponseBody$ {
    /** @deprecated use `AddBalanceSheetResponseBody$inboundSchema` instead. */
    export const inboundSchema = AddBalanceSheetResponseBody$inboundSchema;
    /** @deprecated use `AddBalanceSheetResponseBody$outboundSchema` instead. */
    export const outboundSchema = AddBalanceSheetResponseBody$outboundSchema;
    /** @deprecated use `AddBalanceSheetResponseBody$Outbound` instead. */
    export type Outbound = AddBalanceSheetResponseBody$Outbound;
}

/** @internal */
export const AddBalanceSheetResponse$inboundSchema: z.ZodType<
    AddBalanceSheetResponse,
    z.ZodTypeDef,
    unknown
> = z.union([
    components.UnifiedBalanceSheetOutput$inboundSchema,
    z.lazy(() => AddBalanceSheetResponseBody$inboundSchema),
]);

/** @internal */
export type AddBalanceSheetResponse$Outbound =
    | components.UnifiedBalanceSheetOutput$Outbound
    | AddBalanceSheetResponseBody$Outbound;

/** @internal */
export const AddBalanceSheetResponse$outboundSchema: z.ZodType<
    AddBalanceSheetResponse$Outbound,
    z.ZodTypeDef,
    AddBalanceSheetResponse
> = z.union([
    components.UnifiedBalanceSheetOutput$outboundSchema,
    z.lazy(() => AddBalanceSheetResponseBody$outboundSchema),
]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AddBalanceSheetResponse$ {
    /** @deprecated use `AddBalanceSheetResponse$inboundSchema` instead. */
    export const inboundSchema = AddBalanceSheetResponse$inboundSchema;
    /** @deprecated use `AddBalanceSheetResponse$outboundSchema` instead. */
    export const outboundSchema = AddBalanceSheetResponse$outboundSchema;
    /** @deprecated use `AddBalanceSheetResponse$Outbound` instead. */
    export type Outbound = AddBalanceSheetResponse$Outbound;
}

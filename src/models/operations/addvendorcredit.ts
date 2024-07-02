/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddVendorCreditRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Accounting software.
     */
    remoteData?: boolean | undefined;
    unifiedVendorCreditInput: components.UnifiedVendorCreditInput;
};

export type AddVendorCreditResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedVendorCreditOutput | undefined;
};

export type AddVendorCreditResponse =
    | components.UnifiedVendorCreditOutput
    | AddVendorCreditResponseBody;

/** @internal */
export namespace AddVendorCreditRequest$ {
    export const inboundSchema: z.ZodType<AddVendorCreditRequest, z.ZodTypeDef, unknown> = z
        .object({
            "x-connection-token": z.string(),
            remote_data: z.boolean().optional(),
            UnifiedVendorCreditInput: components.UnifiedVendorCreditInput$.inboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                "x-connection-token": "xConnectionToken",
                remote_data: "remoteData",
                UnifiedVendorCreditInput: "unifiedVendorCreditInput",
            });
        });

    export type Outbound = {
        "x-connection-token": string;
        remote_data?: boolean | undefined;
        UnifiedVendorCreditInput: components.UnifiedVendorCreditInput$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddVendorCreditRequest> = z
        .object({
            xConnectionToken: z.string(),
            remoteData: z.boolean().optional(),
            unifiedVendorCreditInput: components.UnifiedVendorCreditInput$.outboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                xConnectionToken: "x-connection-token",
                remoteData: "remote_data",
                unifiedVendorCreditInput: "UnifiedVendorCreditInput",
            });
        });
}

/** @internal */
export namespace AddVendorCreditResponseBody$ {
    export const inboundSchema: z.ZodType<AddVendorCreditResponseBody, z.ZodTypeDef, unknown> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedVendorCreditOutput$.inboundSchema.optional(),
        });

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedVendorCreditOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddVendorCreditResponseBody> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedVendorCreditOutput$.outboundSchema.optional(),
        });
}

/** @internal */
export namespace AddVendorCreditResponse$ {
    export const inboundSchema: z.ZodType<AddVendorCreditResponse, z.ZodTypeDef, unknown> = z.union(
        [
            components.UnifiedVendorCreditOutput$.inboundSchema,
            z.lazy(() => AddVendorCreditResponseBody$.inboundSchema),
        ]
    );

    export type Outbound =
        | components.UnifiedVendorCreditOutput$.Outbound
        | AddVendorCreditResponseBody$.Outbound;
    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddVendorCreditResponse> =
        z.union([
            components.UnifiedVendorCreditOutput$.outboundSchema,
            z.lazy(() => AddVendorCreditResponseBody$.outboundSchema),
        ]);
}

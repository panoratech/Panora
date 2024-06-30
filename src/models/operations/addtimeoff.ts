/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddTimeoffRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Hris software.
     */
    remoteData?: boolean | undefined;
    unifiedTimeoffInput: components.UnifiedTimeoffInput;
};

export type AddTimeoffResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedTimeoffOutput | undefined;
};

export type AddTimeoffResponse = components.UnifiedTimeoffOutput | AddTimeoffResponseBody;

/** @internal */
export namespace AddTimeoffRequest$ {
    export const inboundSchema: z.ZodType<AddTimeoffRequest, z.ZodTypeDef, unknown> = z
        .object({
            "x-connection-token": z.string(),
            remote_data: z.boolean().optional(),
            UnifiedTimeoffInput: components.UnifiedTimeoffInput$.inboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                "x-connection-token": "xConnectionToken",
                remote_data: "remoteData",
                UnifiedTimeoffInput: "unifiedTimeoffInput",
            });
        });

    export type Outbound = {
        "x-connection-token": string;
        remote_data?: boolean | undefined;
        UnifiedTimeoffInput: components.UnifiedTimeoffInput$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddTimeoffRequest> = z
        .object({
            xConnectionToken: z.string(),
            remoteData: z.boolean().optional(),
            unifiedTimeoffInput: components.UnifiedTimeoffInput$.outboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                xConnectionToken: "x-connection-token",
                remoteData: "remote_data",
                unifiedTimeoffInput: "UnifiedTimeoffInput",
            });
        });
}

/** @internal */
export namespace AddTimeoffResponseBody$ {
    export const inboundSchema: z.ZodType<AddTimeoffResponseBody, z.ZodTypeDef, unknown> = z.object(
        {
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedTimeoffOutput$.inboundSchema.optional(),
        }
    );

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedTimeoffOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddTimeoffResponseBody> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedTimeoffOutput$.outboundSchema.optional(),
        });
}

/** @internal */
export namespace AddTimeoffResponse$ {
    export const inboundSchema: z.ZodType<AddTimeoffResponse, z.ZodTypeDef, unknown> = z.union([
        components.UnifiedTimeoffOutput$.inboundSchema,
        z.lazy(() => AddTimeoffResponseBody$.inboundSchema),
    ]);

    export type Outbound =
        | components.UnifiedTimeoffOutput$.Outbound
        | AddTimeoffResponseBody$.Outbound;
    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddTimeoffResponse> = z.union([
        components.UnifiedTimeoffOutput$.outboundSchema,
        z.lazy(() => AddTimeoffResponseBody$.outboundSchema),
    ]);
}

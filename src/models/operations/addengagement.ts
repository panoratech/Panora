/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddEngagementRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Crm software.
     */
    remoteData?: boolean | undefined;
    unifiedEngagementInput: components.UnifiedEngagementInput;
};

export type AddEngagementResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedEngagementOutput | undefined;
};

export type AddEngagementResponse = {
    httpMeta: components.HTTPMetadata;
    object?: AddEngagementResponseBody | undefined;
    unifiedEngagementOutput?: components.UnifiedEngagementOutput | undefined;
};

/** @internal */
export namespace AddEngagementRequest$ {
    export const inboundSchema: z.ZodType<AddEngagementRequest, z.ZodTypeDef, unknown> = z
        .object({
            "x-connection-token": z.string(),
            remote_data: z.boolean().optional(),
            UnifiedEngagementInput: components.UnifiedEngagementInput$.inboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                "x-connection-token": "xConnectionToken",
                remote_data: "remoteData",
                UnifiedEngagementInput: "unifiedEngagementInput",
            });
        });

    export type Outbound = {
        "x-connection-token": string;
        remote_data?: boolean | undefined;
        UnifiedEngagementInput: components.UnifiedEngagementInput$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddEngagementRequest> = z
        .object({
            xConnectionToken: z.string(),
            remoteData: z.boolean().optional(),
            unifiedEngagementInput: components.UnifiedEngagementInput$.outboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                xConnectionToken: "x-connection-token",
                remoteData: "remote_data",
                unifiedEngagementInput: "UnifiedEngagementInput",
            });
        });
}

/** @internal */
export namespace AddEngagementResponseBody$ {
    export const inboundSchema: z.ZodType<AddEngagementResponseBody, z.ZodTypeDef, unknown> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedEngagementOutput$.inboundSchema.optional(),
        });

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedEngagementOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddEngagementResponseBody> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedEngagementOutput$.outboundSchema.optional(),
        });
}

/** @internal */
export namespace AddEngagementResponse$ {
    export const inboundSchema: z.ZodType<AddEngagementResponse, z.ZodTypeDef, unknown> = z
        .object({
            HttpMeta: components.HTTPMetadata$.inboundSchema,
            object: z.lazy(() => AddEngagementResponseBody$.inboundSchema).optional(),
            UnifiedEngagementOutput: components.UnifiedEngagementOutput$.inboundSchema.optional(),
        })
        .transform((v) => {
            return remap$(v, {
                HttpMeta: "httpMeta",
                UnifiedEngagementOutput: "unifiedEngagementOutput",
            });
        });

    export type Outbound = {
        HttpMeta: components.HTTPMetadata$.Outbound;
        object?: AddEngagementResponseBody$.Outbound | undefined;
        UnifiedEngagementOutput?: components.UnifiedEngagementOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddEngagementResponse> = z
        .object({
            httpMeta: components.HTTPMetadata$.outboundSchema,
            object: z.lazy(() => AddEngagementResponseBody$.outboundSchema).optional(),
            unifiedEngagementOutput: components.UnifiedEngagementOutput$.outboundSchema.optional(),
        })
        .transform((v) => {
            return remap$(v, {
                httpMeta: "HttpMeta",
                unifiedEngagementOutput: "UnifiedEngagementOutput",
            });
        });
}

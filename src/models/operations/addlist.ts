/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddListRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Marketingautomation software.
     */
    remoteData?: boolean | undefined;
    unifiedListInput: components.UnifiedListInput;
};

export type AddListResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedListOutput | undefined;
};

export type AddListResponse = components.UnifiedListOutput | AddListResponseBody;

/** @internal */
export namespace AddListRequest$ {
    export const inboundSchema: z.ZodType<AddListRequest, z.ZodTypeDef, unknown> = z
        .object({
            "x-connection-token": z.string(),
            remote_data: z.boolean().optional(),
            UnifiedListInput: components.UnifiedListInput$.inboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                "x-connection-token": "xConnectionToken",
                remote_data: "remoteData",
                UnifiedListInput: "unifiedListInput",
            });
        });

    export type Outbound = {
        "x-connection-token": string;
        remote_data?: boolean | undefined;
        UnifiedListInput: components.UnifiedListInput$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddListRequest> = z
        .object({
            xConnectionToken: z.string(),
            remoteData: z.boolean().optional(),
            unifiedListInput: components.UnifiedListInput$.outboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                xConnectionToken: "x-connection-token",
                remoteData: "remote_data",
                unifiedListInput: "UnifiedListInput",
            });
        });
}

/** @internal */
export namespace AddListResponseBody$ {
    export const inboundSchema: z.ZodType<AddListResponseBody, z.ZodTypeDef, unknown> = z.object({
        message: z.string().optional(),
        error: z.string().optional(),
        statusCode: z.number(),
        data: components.UnifiedListOutput$.inboundSchema.optional(),
    });

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedListOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddListResponseBody> = z.object({
        message: z.string().optional(),
        error: z.string().optional(),
        statusCode: z.number(),
        data: components.UnifiedListOutput$.outboundSchema.optional(),
    });
}

/** @internal */
export namespace AddListResponse$ {
    export const inboundSchema: z.ZodType<AddListResponse, z.ZodTypeDef, unknown> = z.union([
        components.UnifiedListOutput$.inboundSchema,
        z.lazy(() => AddListResponseBody$.inboundSchema),
    ]);

    export type Outbound = components.UnifiedListOutput$.Outbound | AddListResponseBody$.Outbound;
    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddListResponse> = z.union([
        components.UnifiedListOutput$.outboundSchema,
        z.lazy(() => AddListResponseBody$.outboundSchema),
    ]);
}

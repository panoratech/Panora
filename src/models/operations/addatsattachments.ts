/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddAtsAttachmentsRequest = {
    connectionToken: string;
    /**
     * Set to true to include data from the original Ats software.
     */
    remoteData?: boolean | undefined;
    /**
     * The connection token
     */
    xConnectionToken: string;
    requestBody: Array<components.UnifiedAttachmentInput>;
};

export type AddAtsAttachmentsResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedAttachmentOutput | undefined;
};

export type AddAtsAttachmentsResponse = {
    httpMeta: components.HTTPMetadata;
    object?: AddAtsAttachmentsResponseBody | undefined;
    unifiedAttachmentOutputs?: Array<components.UnifiedAttachmentOutput> | undefined;
};

/** @internal */
export namespace AddAtsAttachmentsRequest$ {
    export const inboundSchema: z.ZodType<AddAtsAttachmentsRequest, z.ZodTypeDef, unknown> = z
        .object({
            connection_token: z.string(),
            remote_data: z.boolean().optional(),
            "x-connection-token": z.string(),
            RequestBody: z.array(components.UnifiedAttachmentInput$.inboundSchema),
        })
        .transform((v) => {
            return remap$(v, {
                connection_token: "connectionToken",
                remote_data: "remoteData",
                "x-connection-token": "xConnectionToken",
                RequestBody: "requestBody",
            });
        });

    export type Outbound = {
        connection_token: string;
        remote_data?: boolean | undefined;
        "x-connection-token": string;
        RequestBody: Array<components.UnifiedAttachmentInput$.Outbound>;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddAtsAttachmentsRequest> = z
        .object({
            connectionToken: z.string(),
            remoteData: z.boolean().optional(),
            xConnectionToken: z.string(),
            requestBody: z.array(components.UnifiedAttachmentInput$.outboundSchema),
        })
        .transform((v) => {
            return remap$(v, {
                connectionToken: "connection_token",
                remoteData: "remote_data",
                xConnectionToken: "x-connection-token",
                requestBody: "RequestBody",
            });
        });
}

/** @internal */
export namespace AddAtsAttachmentsResponseBody$ {
    export const inboundSchema: z.ZodType<AddAtsAttachmentsResponseBody, z.ZodTypeDef, unknown> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedAttachmentOutput$.inboundSchema.optional(),
        });

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedAttachmentOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddAtsAttachmentsResponseBody> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedAttachmentOutput$.outboundSchema.optional(),
        });
}

/** @internal */
export namespace AddAtsAttachmentsResponse$ {
    export const inboundSchema: z.ZodType<AddAtsAttachmentsResponse, z.ZodTypeDef, unknown> = z
        .object({
            HttpMeta: components.HTTPMetadata$.inboundSchema,
            object: z.lazy(() => AddAtsAttachmentsResponseBody$.inboundSchema).optional(),
            UnifiedAttachmentOutputs: z
                .array(components.UnifiedAttachmentOutput$.inboundSchema)
                .optional(),
        })
        .transform((v) => {
            return remap$(v, {
                HttpMeta: "httpMeta",
                UnifiedAttachmentOutputs: "unifiedAttachmentOutputs",
            });
        });

    export type Outbound = {
        HttpMeta: components.HTTPMetadata$.Outbound;
        object?: AddAtsAttachmentsResponseBody$.Outbound | undefined;
        UnifiedAttachmentOutputs?: Array<components.UnifiedAttachmentOutput$.Outbound> | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddAtsAttachmentsResponse> = z
        .object({
            httpMeta: components.HTTPMetadata$.outboundSchema,
            object: z.lazy(() => AddAtsAttachmentsResponseBody$.outboundSchema).optional(),
            unifiedAttachmentOutputs: z
                .array(components.UnifiedAttachmentOutput$.outboundSchema)
                .optional(),
        })
        .transform((v) => {
            return remap$(v, {
                httpMeta: "HttpMeta",
                unifiedAttachmentOutputs: "UnifiedAttachmentOutputs",
            });
        });
}

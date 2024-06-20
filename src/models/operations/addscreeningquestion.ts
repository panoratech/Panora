/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type AddScreeningQuestionRequest = {
    /**
     * The connection token
     */
    xConnectionToken: string;
    /**
     * Set to true to include data from the original Ats software.
     */
    remoteData?: boolean | undefined;
    unifiedScreeningQuestionInput: components.UnifiedScreeningQuestionInput;
};

export type AddScreeningQuestionResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedScreeningQuestionOutput | undefined;
};

export type AddScreeningQuestionResponse = {
    httpMeta: components.HTTPMetadata;
    object?: AddScreeningQuestionResponseBody | undefined;
    unifiedScreeningQuestionOutput?: components.UnifiedScreeningQuestionOutput | undefined;
};

/** @internal */
export namespace AddScreeningQuestionRequest$ {
    export const inboundSchema: z.ZodType<AddScreeningQuestionRequest, z.ZodTypeDef, unknown> = z
        .object({
            "x-connection-token": z.string(),
            remote_data: z.boolean().optional(),
            UnifiedScreeningQuestionInput: components.UnifiedScreeningQuestionInput$.inboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                "x-connection-token": "xConnectionToken",
                remote_data: "remoteData",
                UnifiedScreeningQuestionInput: "unifiedScreeningQuestionInput",
            });
        });

    export type Outbound = {
        "x-connection-token": string;
        remote_data?: boolean | undefined;
        UnifiedScreeningQuestionInput: components.UnifiedScreeningQuestionInput$.Outbound;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddScreeningQuestionRequest> = z
        .object({
            xConnectionToken: z.string(),
            remoteData: z.boolean().optional(),
            unifiedScreeningQuestionInput: components.UnifiedScreeningQuestionInput$.outboundSchema,
        })
        .transform((v) => {
            return remap$(v, {
                xConnectionToken: "x-connection-token",
                remoteData: "remote_data",
                unifiedScreeningQuestionInput: "UnifiedScreeningQuestionInput",
            });
        });
}

/** @internal */
export namespace AddScreeningQuestionResponseBody$ {
    export const inboundSchema: z.ZodType<AddScreeningQuestionResponseBody, z.ZodTypeDef, unknown> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedScreeningQuestionOutput$.inboundSchema.optional(),
        });

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedScreeningQuestionOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<
        Outbound,
        z.ZodTypeDef,
        AddScreeningQuestionResponseBody
    > = z.object({
        message: z.string().optional(),
        error: z.string().optional(),
        statusCode: z.number(),
        data: components.UnifiedScreeningQuestionOutput$.outboundSchema.optional(),
    });
}

/** @internal */
export namespace AddScreeningQuestionResponse$ {
    export const inboundSchema: z.ZodType<AddScreeningQuestionResponse, z.ZodTypeDef, unknown> = z
        .object({
            HttpMeta: components.HTTPMetadata$.inboundSchema,
            object: z.lazy(() => AddScreeningQuestionResponseBody$.inboundSchema).optional(),
            UnifiedScreeningQuestionOutput:
                components.UnifiedScreeningQuestionOutput$.inboundSchema.optional(),
        })
        .transform((v) => {
            return remap$(v, {
                HttpMeta: "httpMeta",
                UnifiedScreeningQuestionOutput: "unifiedScreeningQuestionOutput",
            });
        });

    export type Outbound = {
        HttpMeta: components.HTTPMetadata$.Outbound;
        object?: AddScreeningQuestionResponseBody$.Outbound | undefined;
        UnifiedScreeningQuestionOutput?:
            | components.UnifiedScreeningQuestionOutput$.Outbound
            | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, AddScreeningQuestionResponse> = z
        .object({
            httpMeta: components.HTTPMetadata$.outboundSchema,
            object: z.lazy(() => AddScreeningQuestionResponseBody$.outboundSchema).optional(),
            unifiedScreeningQuestionOutput:
                components.UnifiedScreeningQuestionOutput$.outboundSchema.optional(),
        })
        .transform((v) => {
            return remap$(v, {
                httpMeta: "HttpMeta",
                unifiedScreeningQuestionOutput: "UnifiedScreeningQuestionOutput",
            });
        });
}

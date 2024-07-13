/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetScreeningQuestionRequest = {
    /**
     * id of the screeningquestion you want to retrieve.
     */
    id: string;
    /**
     * Set to true to include data from the original Ats software.
     */
    remoteData?: boolean | undefined;
};

export type GetScreeningQuestionResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedScreeningQuestionOutput | undefined;
};

/** @internal */
export const GetScreeningQuestionRequest$inboundSchema: z.ZodType<
    GetScreeningQuestionRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        id: z.string(),
        remote_data: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            remote_data: "remoteData",
        });
    });

/** @internal */
export type GetScreeningQuestionRequest$Outbound = {
    id: string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetScreeningQuestionRequest$outboundSchema: z.ZodType<
    GetScreeningQuestionRequest$Outbound,
    z.ZodTypeDef,
    GetScreeningQuestionRequest
> = z
    .object({
        id: z.string(),
        remoteData: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            remoteData: "remote_data",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetScreeningQuestionRequest$ {
    /** @deprecated use `GetScreeningQuestionRequest$inboundSchema` instead. */
    export const inboundSchema = GetScreeningQuestionRequest$inboundSchema;
    /** @deprecated use `GetScreeningQuestionRequest$outboundSchema` instead. */
    export const outboundSchema = GetScreeningQuestionRequest$outboundSchema;
    /** @deprecated use `GetScreeningQuestionRequest$Outbound` instead. */
    export type Outbound = GetScreeningQuestionRequest$Outbound;
}

/** @internal */
export const GetScreeningQuestionResponseBody$inboundSchema: z.ZodType<
    GetScreeningQuestionResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedScreeningQuestionOutput$inboundSchema.optional(),
});

/** @internal */
export type GetScreeningQuestionResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedScreeningQuestionOutput$Outbound | undefined;
};

/** @internal */
export const GetScreeningQuestionResponseBody$outboundSchema: z.ZodType<
    GetScreeningQuestionResponseBody$Outbound,
    z.ZodTypeDef,
    GetScreeningQuestionResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedScreeningQuestionOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetScreeningQuestionResponseBody$ {
    /** @deprecated use `GetScreeningQuestionResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetScreeningQuestionResponseBody$inboundSchema;
    /** @deprecated use `GetScreeningQuestionResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetScreeningQuestionResponseBody$outboundSchema;
    /** @deprecated use `GetScreeningQuestionResponseBody$Outbound` instead. */
    export type Outbound = GetScreeningQuestionResponseBody$Outbound;
}

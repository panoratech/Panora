/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetCommentRequest = {
    /**
     * id of the `comment` you want to retrive.
     */
    id: string;
    /**
     * Set to true to include data from the original Ticketing software.
     */
    remoteData?: boolean | undefined;
};

export type GetCommentResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedCommentOutput | undefined;
};

/** @internal */
export namespace GetCommentRequest$ {
    export const inboundSchema: z.ZodType<GetCommentRequest, z.ZodTypeDef, unknown> = z
        .object({
            id: z.string(),
            remote_data: z.boolean().optional(),
        })
        .transform((v) => {
            return remap$(v, {
                remote_data: "remoteData",
            });
        });

    export type Outbound = {
        id: string;
        remote_data?: boolean | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, GetCommentRequest> = z
        .object({
            id: z.string(),
            remoteData: z.boolean().optional(),
        })
        .transform((v) => {
            return remap$(v, {
                remoteData: "remote_data",
            });
        });
}

/** @internal */
export namespace GetCommentResponseBody$ {
    export const inboundSchema: z.ZodType<GetCommentResponseBody, z.ZodTypeDef, unknown> = z.object(
        {
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedCommentOutput$.inboundSchema.optional(),
        }
    );

    export type Outbound = {
        message?: string | undefined;
        error?: string | undefined;
        statusCode: number;
        data?: components.UnifiedCommentOutput$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, GetCommentResponseBody> =
        z.object({
            message: z.string().optional(),
            error: z.string().optional(),
            statusCode: z.number(),
            data: components.UnifiedCommentOutput$.outboundSchema.optional(),
        });
}

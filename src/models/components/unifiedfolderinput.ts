/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedFolderInput = {};

/** @internal */
export namespace UnifiedFolderInput$ {
    export const inboundSchema: z.ZodType<UnifiedFolderInput, z.ZodTypeDef, unknown> = z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedFolderInput> = z.object(
        {}
    );
}

/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedGroupInput = {};

/** @internal */
export namespace UnifiedGroupInput$ {
    export const inboundSchema: z.ZodType<UnifiedGroupInput, z.ZodTypeDef, unknown> = z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedGroupInput> = z.object(
        {}
    );
}

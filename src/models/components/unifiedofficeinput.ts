/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedOfficeInput = {};

/** @internal */
export namespace UnifiedOfficeInput$ {
    export const inboundSchema: z.ZodType<UnifiedOfficeInput, z.ZodTypeDef, unknown> = z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, UnifiedOfficeInput> = z.object(
        {}
    );
}

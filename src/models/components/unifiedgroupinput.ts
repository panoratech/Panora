/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedGroupInput = {};

/** @internal */
export const UnifiedGroupInput$inboundSchema: z.ZodType<UnifiedGroupInput, z.ZodTypeDef, unknown> =
    z.object({});

/** @internal */
export type UnifiedGroupInput$Outbound = {};

/** @internal */
export const UnifiedGroupInput$outboundSchema: z.ZodType<
    UnifiedGroupInput$Outbound,
    z.ZodTypeDef,
    UnifiedGroupInput
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedGroupInput$ {
    /** @deprecated use `UnifiedGroupInput$inboundSchema` instead. */
    export const inboundSchema = UnifiedGroupInput$inboundSchema;
    /** @deprecated use `UnifiedGroupInput$outboundSchema` instead. */
    export const outboundSchema = UnifiedGroupInput$outboundSchema;
    /** @deprecated use `UnifiedGroupInput$Outbound` instead. */
    export type Outbound = UnifiedGroupInput$Outbound;
}

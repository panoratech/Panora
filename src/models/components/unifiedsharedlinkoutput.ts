/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedSharedLinkOutput = {};

/** @internal */
export const UnifiedSharedLinkOutput$inboundSchema: z.ZodType<
    UnifiedSharedLinkOutput,
    z.ZodTypeDef,
    unknown
> = z.object({});

/** @internal */
export type UnifiedSharedLinkOutput$Outbound = {};

/** @internal */
export const UnifiedSharedLinkOutput$outboundSchema: z.ZodType<
    UnifiedSharedLinkOutput$Outbound,
    z.ZodTypeDef,
    UnifiedSharedLinkOutput
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedSharedLinkOutput$ {
    /** @deprecated use `UnifiedSharedLinkOutput$inboundSchema` instead. */
    export const inboundSchema = UnifiedSharedLinkOutput$inboundSchema;
    /** @deprecated use `UnifiedSharedLinkOutput$outboundSchema` instead. */
    export const outboundSchema = UnifiedSharedLinkOutput$outboundSchema;
    /** @deprecated use `UnifiedSharedLinkOutput$Outbound` instead. */
    export type Outbound = UnifiedSharedLinkOutput$Outbound;
}

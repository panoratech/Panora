/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedVendorCreditOutput = {};

/** @internal */
export const UnifiedVendorCreditOutput$inboundSchema: z.ZodType<
    UnifiedVendorCreditOutput,
    z.ZodTypeDef,
    unknown
> = z.object({});

/** @internal */
export type UnifiedVendorCreditOutput$Outbound = {};

/** @internal */
export const UnifiedVendorCreditOutput$outboundSchema: z.ZodType<
    UnifiedVendorCreditOutput$Outbound,
    z.ZodTypeDef,
    UnifiedVendorCreditOutput
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedVendorCreditOutput$ {
    /** @deprecated use `UnifiedVendorCreditOutput$inboundSchema` instead. */
    export const inboundSchema = UnifiedVendorCreditOutput$inboundSchema;
    /** @deprecated use `UnifiedVendorCreditOutput$outboundSchema` instead. */
    export const outboundSchema = UnifiedVendorCreditOutput$outboundSchema;
    /** @deprecated use `UnifiedVendorCreditOutput$Outbound` instead. */
    export type Outbound = UnifiedVendorCreditOutput$Outbound;
}

/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type UnifiedCampaignOutput = {};

/** @internal */
export const UnifiedCampaignOutput$inboundSchema: z.ZodType<
    UnifiedCampaignOutput,
    z.ZodTypeDef,
    unknown
> = z.object({});

/** @internal */
export type UnifiedCampaignOutput$Outbound = {};

/** @internal */
export const UnifiedCampaignOutput$outboundSchema: z.ZodType<
    UnifiedCampaignOutput$Outbound,
    z.ZodTypeDef,
    UnifiedCampaignOutput
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedCampaignOutput$ {
    /** @deprecated use `UnifiedCampaignOutput$inboundSchema` instead. */
    export const inboundSchema = UnifiedCampaignOutput$inboundSchema;
    /** @deprecated use `UnifiedCampaignOutput$outboundSchema` instead. */
    export const outboundSchema = UnifiedCampaignOutput$outboundSchema;
    /** @deprecated use `UnifiedCampaignOutput$Outbound` instead. */
    export type Outbound = UnifiedCampaignOutput$Outbound;
}

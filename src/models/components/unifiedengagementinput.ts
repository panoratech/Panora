/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type UnifiedEngagementInputFieldMappings = {};

export type UnifiedEngagementInput = {
    /**
     * The content of the engagement
     */
    content?: string | undefined;
    /**
     * The direction of the engagement. Authorized values are INBOUND or OUTBOUND
     */
    direction?: string | undefined;
    /**
     * The subject of the engagement
     */
    subject?: string | undefined;
    /**
     * The start time of the engagement
     */
    startAt?: Date | undefined;
    /**
     * The end time of the engagement
     */
    endTime?: Date | undefined;
    /**
     * The type of the engagement. Authorized values are EMAIL, CALL or MEETING
     */
    type: string;
    /**
     * The uuid of the user tied to the engagement
     */
    userId?: string | undefined;
    /**
     * The uuid of the company tied to the engagement
     */
    companyId?: string | undefined;
    /**
     * The uuids of contacts tied to the engagement object
     */
    contacts?: Array<string> | undefined;
    fieldMappings: UnifiedEngagementInputFieldMappings;
};

/** @internal */
export const UnifiedEngagementInputFieldMappings$inboundSchema: z.ZodType<
    UnifiedEngagementInputFieldMappings,
    z.ZodTypeDef,
    unknown
> = z.object({});

/** @internal */
export type UnifiedEngagementInputFieldMappings$Outbound = {};

/** @internal */
export const UnifiedEngagementInputFieldMappings$outboundSchema: z.ZodType<
    UnifiedEngagementInputFieldMappings$Outbound,
    z.ZodTypeDef,
    UnifiedEngagementInputFieldMappings
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedEngagementInputFieldMappings$ {
    /** @deprecated use `UnifiedEngagementInputFieldMappings$inboundSchema` instead. */
    export const inboundSchema = UnifiedEngagementInputFieldMappings$inboundSchema;
    /** @deprecated use `UnifiedEngagementInputFieldMappings$outboundSchema` instead. */
    export const outboundSchema = UnifiedEngagementInputFieldMappings$outboundSchema;
    /** @deprecated use `UnifiedEngagementInputFieldMappings$Outbound` instead. */
    export type Outbound = UnifiedEngagementInputFieldMappings$Outbound;
}

/** @internal */
export const UnifiedEngagementInput$inboundSchema: z.ZodType<
    UnifiedEngagementInput,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        content: z.string().optional(),
        direction: z.string().optional(),
        subject: z.string().optional(),
        start_at: z
            .string()
            .datetime({ offset: true })
            .transform((v) => new Date(v))
            .optional(),
        end_time: z
            .string()
            .datetime({ offset: true })
            .transform((v) => new Date(v))
            .optional(),
        type: z.string(),
        user_id: z.string().optional(),
        company_id: z.string().optional(),
        contacts: z.array(z.string()).optional(),
        field_mappings: z.lazy(() => UnifiedEngagementInputFieldMappings$inboundSchema),
    })
    .transform((v) => {
        return remap$(v, {
            start_at: "startAt",
            end_time: "endTime",
            user_id: "userId",
            company_id: "companyId",
            field_mappings: "fieldMappings",
        });
    });

/** @internal */
export type UnifiedEngagementInput$Outbound = {
    content?: string | undefined;
    direction?: string | undefined;
    subject?: string | undefined;
    start_at?: string | undefined;
    end_time?: string | undefined;
    type: string;
    user_id?: string | undefined;
    company_id?: string | undefined;
    contacts?: Array<string> | undefined;
    field_mappings: UnifiedEngagementInputFieldMappings$Outbound;
};

/** @internal */
export const UnifiedEngagementInput$outboundSchema: z.ZodType<
    UnifiedEngagementInput$Outbound,
    z.ZodTypeDef,
    UnifiedEngagementInput
> = z
    .object({
        content: z.string().optional(),
        direction: z.string().optional(),
        subject: z.string().optional(),
        startAt: z
            .date()
            .transform((v) => v.toISOString())
            .optional(),
        endTime: z
            .date()
            .transform((v) => v.toISOString())
            .optional(),
        type: z.string(),
        userId: z.string().optional(),
        companyId: z.string().optional(),
        contacts: z.array(z.string()).optional(),
        fieldMappings: z.lazy(() => UnifiedEngagementInputFieldMappings$outboundSchema),
    })
    .transform((v) => {
        return remap$(v, {
            startAt: "start_at",
            endTime: "end_time",
            userId: "user_id",
            companyId: "company_id",
            fieldMappings: "field_mappings",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UnifiedEngagementInput$ {
    /** @deprecated use `UnifiedEngagementInput$inboundSchema` instead. */
    export const inboundSchema = UnifiedEngagementInput$inboundSchema;
    /** @deprecated use `UnifiedEngagementInput$outboundSchema` instead. */
    export const outboundSchema = UnifiedEngagementInput$outboundSchema;
    /** @deprecated use `UnifiedEngagementInput$Outbound` instead. */
    export type Outbound = UnifiedEngagementInput$Outbound;
}

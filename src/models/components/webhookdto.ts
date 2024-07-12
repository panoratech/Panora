/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type WebhookDto = {
    url: string;
    description?: string | undefined;
    idProject: string;
    scope: Array<string>;
};

/** @internal */
export const WebhookDto$inboundSchema: z.ZodType<WebhookDto, z.ZodTypeDef, unknown> = z
    .object({
        url: z.string(),
        description: z.string().optional(),
        id_project: z.string(),
        scope: z.array(z.string()),
    })
    .transform((v) => {
        return remap$(v, {
            id_project: "idProject",
        });
    });

/** @internal */
export type WebhookDto$Outbound = {
    url: string;
    description?: string | undefined;
    id_project: string;
    scope: Array<string>;
};

/** @internal */
export const WebhookDto$outboundSchema: z.ZodType<WebhookDto$Outbound, z.ZodTypeDef, WebhookDto> = z
    .object({
        url: z.string(),
        description: z.string().optional(),
        idProject: z.string(),
        scope: z.array(z.string()),
    })
    .transform((v) => {
        return remap$(v, {
            idProject: "id_project",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace WebhookDto$ {
    /** @deprecated use `WebhookDto$inboundSchema` instead. */
    export const inboundSchema = WebhookDto$inboundSchema;
    /** @deprecated use `WebhookDto$outboundSchema` instead. */
    export const outboundSchema = WebhookDto$outboundSchema;
    /** @deprecated use `WebhookDto$Outbound` instead. */
    export type Outbound = WebhookDto$Outbound;
}

/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type HandleThirdPartyWebhookRequest = {
    endpointUuid: string;
};

/** @internal */
export namespace HandleThirdPartyWebhookRequest$ {
    export const inboundSchema: z.ZodType<HandleThirdPartyWebhookRequest, z.ZodTypeDef, unknown> = z
        .object({
            endpoint_uuid: z.string(),
        })
        .transform((v) => {
            return remap$(v, {
                endpoint_uuid: "endpointUuid",
            });
        });

    export type Outbound = {
        endpoint_uuid: string;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, HandleThirdPartyWebhookRequest> =
        z
            .object({
                endpointUuid: z.string(),
            })
            .transform((v) => {
                return remap$(v, {
                    endpointUuid: "endpoint_uuid",
                });
            });
}

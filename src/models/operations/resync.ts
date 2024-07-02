/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type ResyncRequest = {
    vertical: string;
};

/** @internal */
export namespace ResyncRequest$ {
    export const inboundSchema: z.ZodType<ResyncRequest, z.ZodTypeDef, unknown> = z.object({
        vertical: z.string(),
    });

    export type Outbound = {
        vertical: string;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, ResyncRequest> = z.object({
        vertical: z.string(),
    });
}

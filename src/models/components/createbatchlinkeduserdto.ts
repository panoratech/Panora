/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type CreateBatchLinkedUserDto = {
    linkedUserOriginIds: Array<string>;
    alias: string;
    idProject: string;
};

/** @internal */
export const CreateBatchLinkedUserDto$inboundSchema: z.ZodType<
    CreateBatchLinkedUserDto,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        linked_user_origin_ids: z.array(z.string()),
        alias: z.string(),
        id_project: z.string(),
    })
    .transform((v) => {
        return remap$(v, {
            linked_user_origin_ids: "linkedUserOriginIds",
            id_project: "idProject",
        });
    });

/** @internal */
export type CreateBatchLinkedUserDto$Outbound = {
    linked_user_origin_ids: Array<string>;
    alias: string;
    id_project: string;
};

/** @internal */
export const CreateBatchLinkedUserDto$outboundSchema: z.ZodType<
    CreateBatchLinkedUserDto$Outbound,
    z.ZodTypeDef,
    CreateBatchLinkedUserDto
> = z
    .object({
        linkedUserOriginIds: z.array(z.string()),
        alias: z.string(),
        idProject: z.string(),
    })
    .transform((v) => {
        return remap$(v, {
            linkedUserOriginIds: "linked_user_origin_ids",
            idProject: "id_project",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateBatchLinkedUserDto$ {
    /** @deprecated use `CreateBatchLinkedUserDto$inboundSchema` instead. */
    export const inboundSchema = CreateBatchLinkedUserDto$inboundSchema;
    /** @deprecated use `CreateBatchLinkedUserDto$outboundSchema` instead. */
    export const outboundSchema = CreateBatchLinkedUserDto$outboundSchema;
    /** @deprecated use `CreateBatchLinkedUserDto$Outbound` instead. */
    export type Outbound = CreateBatchLinkedUserDto$Outbound;
}

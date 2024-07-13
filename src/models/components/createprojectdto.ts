/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as z from "zod";

export type CreateProjectDto = {
    name: string;
    idOrganization?: string | undefined;
    idUser: string;
};

/** @internal */
export const CreateProjectDto$inboundSchema: z.ZodType<CreateProjectDto, z.ZodTypeDef, unknown> = z
    .object({
        name: z.string(),
        id_organization: z.string().optional(),
        id_user: z.string(),
    })
    .transform((v) => {
        return remap$(v, {
            id_organization: "idOrganization",
            id_user: "idUser",
        });
    });

/** @internal */
export type CreateProjectDto$Outbound = {
    name: string;
    id_organization?: string | undefined;
    id_user: string;
};

/** @internal */
export const CreateProjectDto$outboundSchema: z.ZodType<
    CreateProjectDto$Outbound,
    z.ZodTypeDef,
    CreateProjectDto
> = z
    .object({
        name: z.string(),
        idOrganization: z.string().optional(),
        idUser: z.string(),
    })
    .transform((v) => {
        return remap$(v, {
            idOrganization: "id_organization",
            idUser: "id_user",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateProjectDto$ {
    /** @deprecated use `CreateProjectDto$inboundSchema` instead. */
    export const inboundSchema = CreateProjectDto$inboundSchema;
    /** @deprecated use `CreateProjectDto$outboundSchema` instead. */
    export const outboundSchema = CreateProjectDto$outboundSchema;
    /** @deprecated use `CreateProjectDto$Outbound` instead. */
    export type Outbound = CreateProjectDto$Outbound;
}

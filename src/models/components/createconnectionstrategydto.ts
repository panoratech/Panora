/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import * as z from "zod";

export type CreateConnectionStrategyDto = {
    type: string;
    attributes: Array<string>;
    values: Array<string>;
};

/** @internal */
export const CreateConnectionStrategyDto$inboundSchema: z.ZodType<
    CreateConnectionStrategyDto,
    z.ZodTypeDef,
    unknown
> = z.object({
    type: z.string(),
    attributes: z.array(z.string()),
    values: z.array(z.string()),
});

/** @internal */
export type CreateConnectionStrategyDto$Outbound = {
    type: string;
    attributes: Array<string>;
    values: Array<string>;
};

/** @internal */
export const CreateConnectionStrategyDto$outboundSchema: z.ZodType<
    CreateConnectionStrategyDto$Outbound,
    z.ZodTypeDef,
    CreateConnectionStrategyDto
> = z.object({
    type: z.string(),
    attributes: z.array(z.string()),
    values: z.array(z.string()),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateConnectionStrategyDto$ {
    /** @deprecated use `CreateConnectionStrategyDto$inboundSchema` instead. */
    export const inboundSchema = CreateConnectionStrategyDto$inboundSchema;
    /** @deprecated use `CreateConnectionStrategyDto$outboundSchema` instead. */
    export const outboundSchema = CreateConnectionStrategyDto$outboundSchema;
    /** @deprecated use `CreateConnectionStrategyDto$Outbound` instead. */
    export type Outbound = CreateConnectionStrategyDto$Outbound;
}

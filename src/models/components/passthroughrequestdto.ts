/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { ClosedEnum } from "../../types/enums.js";
import * as z from "zod";

export const Method = {
    Get: "GET",
    Post: "POST",
    Patch: "PATCH",
    Delete: "DELETE",
    Put: "PUT",
} as const;
export type Method = ClosedEnum<typeof Method>;

export type Data = {};

export type Headers = {};

export type PassThroughRequestDto = {
    method: Method;
    path: string;
    data?: Data | undefined;
    headers?: Headers | undefined;
};

/** @internal */
export namespace Method$ {
    export const inboundSchema: z.ZodNativeEnum<typeof Method> = z.nativeEnum(Method);
    export const outboundSchema: z.ZodNativeEnum<typeof Method> = inboundSchema;
}

/** @internal */
export namespace Data$ {
    export const inboundSchema: z.ZodType<Data, z.ZodTypeDef, unknown> = z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, Data> = z.object({});
}

/** @internal */
export namespace Headers$ {
    export const inboundSchema: z.ZodType<Headers, z.ZodTypeDef, unknown> = z.object({});

    export type Outbound = {};

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, Headers> = z.object({});
}

/** @internal */
export namespace PassThroughRequestDto$ {
    export const inboundSchema: z.ZodType<PassThroughRequestDto, z.ZodTypeDef, unknown> = z.object({
        method: Method$.inboundSchema,
        path: z.string(),
        data: z.lazy(() => Data$.inboundSchema).optional(),
        headers: z.lazy(() => Headers$.inboundSchema).optional(),
    });

    export type Outbound = {
        method: string;
        path: string;
        data?: Data$.Outbound | undefined;
        headers?: Headers$.Outbound | undefined;
    };

    export const outboundSchema: z.ZodType<Outbound, z.ZodTypeDef, PassThroughRequestDto> =
        z.object({
            method: Method$.outboundSchema,
            path: z.string(),
            data: z.lazy(() => Data$.outboundSchema).optional(),
            headers: z.lazy(() => Headers$.outboundSchema).optional(),
        });
}

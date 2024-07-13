/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { remap as remap$ } from "../../lib/primitives.js";
import * as components from "../components/index.js";
import * as z from "zod";

export type GetEmployeePayrollRunRequest = {
    /**
     * id of the employeepayrollrun you want to retrieve.
     */
    id: string;
    /**
     * Set to true to include data from the original Hris software.
     */
    remoteData?: boolean | undefined;
};

export type GetEmployeePayrollRunResponseBody = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedEmployeePayrollRunOutput | undefined;
};

/** @internal */
export const GetEmployeePayrollRunRequest$inboundSchema: z.ZodType<
    GetEmployeePayrollRunRequest,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        id: z.string(),
        remote_data: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            remote_data: "remoteData",
        });
    });

/** @internal */
export type GetEmployeePayrollRunRequest$Outbound = {
    id: string;
    remote_data?: boolean | undefined;
};

/** @internal */
export const GetEmployeePayrollRunRequest$outboundSchema: z.ZodType<
    GetEmployeePayrollRunRequest$Outbound,
    z.ZodTypeDef,
    GetEmployeePayrollRunRequest
> = z
    .object({
        id: z.string(),
        remoteData: z.boolean().optional(),
    })
    .transform((v) => {
        return remap$(v, {
            remoteData: "remote_data",
        });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetEmployeePayrollRunRequest$ {
    /** @deprecated use `GetEmployeePayrollRunRequest$inboundSchema` instead. */
    export const inboundSchema = GetEmployeePayrollRunRequest$inboundSchema;
    /** @deprecated use `GetEmployeePayrollRunRequest$outboundSchema` instead. */
    export const outboundSchema = GetEmployeePayrollRunRequest$outboundSchema;
    /** @deprecated use `GetEmployeePayrollRunRequest$Outbound` instead. */
    export type Outbound = GetEmployeePayrollRunRequest$Outbound;
}

/** @internal */
export const GetEmployeePayrollRunResponseBody$inboundSchema: z.ZodType<
    GetEmployeePayrollRunResponseBody,
    z.ZodTypeDef,
    unknown
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedEmployeePayrollRunOutput$inboundSchema.optional(),
});

/** @internal */
export type GetEmployeePayrollRunResponseBody$Outbound = {
    message?: string | undefined;
    error?: string | undefined;
    statusCode: number;
    data?: components.UnifiedEmployeePayrollRunOutput$Outbound | undefined;
};

/** @internal */
export const GetEmployeePayrollRunResponseBody$outboundSchema: z.ZodType<
    GetEmployeePayrollRunResponseBody$Outbound,
    z.ZodTypeDef,
    GetEmployeePayrollRunResponseBody
> = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
    statusCode: z.number(),
    data: components.UnifiedEmployeePayrollRunOutput$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetEmployeePayrollRunResponseBody$ {
    /** @deprecated use `GetEmployeePayrollRunResponseBody$inboundSchema` instead. */
    export const inboundSchema = GetEmployeePayrollRunResponseBody$inboundSchema;
    /** @deprecated use `GetEmployeePayrollRunResponseBody$outboundSchema` instead. */
    export const outboundSchema = GetEmployeePayrollRunResponseBody$outboundSchema;
    /** @deprecated use `GetEmployeePayrollRunResponseBody$Outbound` instead. */
    export type Outbound = GetEmployeePayrollRunResponseBody$Outbound;
}

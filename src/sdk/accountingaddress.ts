/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { SDKHooks } from "../hooks/hooks.js";
import { SDKOptions, serverURLFromOptions } from "../lib/config.js";
import {
    encodeFormQuery as encodeFormQuery$,
    encodeJSON as encodeJSON$,
    encodeSimple as encodeSimple$,
} from "../lib/encodings.js";
import { HTTPClient } from "../lib/http.js";
import * as schemas$ from "../lib/schemas.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as operations from "../models/operations/index.js";

export class AccountingAddress extends ClientSDK {
    private readonly options$: SDKOptions & { hooks?: SDKHooks };

    constructor(options: SDKOptions = {}) {
        const opt = options as unknown;
        let hooks: SDKHooks;
        if (
            typeof opt === "object" &&
            opt != null &&
            "hooks" in opt &&
            opt.hooks instanceof SDKHooks
        ) {
            hooks = opt.hooks;
        } else {
            hooks = new SDKHooks();
        }

        super({
            client: options.httpClient || new HTTPClient(),
            baseURL: serverURLFromOptions(options),
            hooks,
        });

        this.options$ = { ...options, hooks };
        void this.options$;
    }

    /**
     * List a batch of Addresss
     */
    async getAddresss(
        request: operations.GetAddresssRequest,
        options?: RequestOptions
    ): Promise<operations.GetAddresssResponseBody> {
        const input$ = request;

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetAddresssRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const path$ = this.templateURLComponent("/accounting/address")();

        const query$ = encodeFormQuery$({
            remote_data: payload$.remote_data,
        });

        const headers$ = new Headers({
            Accept: "application/json",
            "x-connection-token": encodeSimple$(
                "x-connection-token",
                payload$["x-connection-token"],
                { explode: false, charEncoding: "none" }
            ),
        });

        let security$;
        if (typeof this.options$.jwt === "function") {
            security$ = { jwt: await this.options$.jwt() };
        } else if (this.options$.jwt) {
            security$ = { jwt: this.options$.jwt };
        } else {
            security$ = {};
        }
        const context = {
            operationID: "getAddresss",
            oAuth2Scopes: [],
            securitySource: this.options$.jwt,
        };
        const securitySettings$ = this.resolveGlobalSecurity(security$);

        const request$ = this.createRequest$(
            context,
            {
                security: securitySettings$,
                method: "GET",
                path: path$,
                headers: headers$,
                query: query$,
                body: body$,
            },
            options
        );

        const response = await this.do$(request$, { context, errorCodes: ["4XX", "5XX"] });

        const [result$] = await this.matcher<operations.GetAddresssResponseBody>()
            .json(200, operations.GetAddresssResponseBody$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }

    /**
     * Create a Address
     *
     * @remarks
     * Create a address in any supported Accounting software
     */
    async addAddress(
        request: operations.AddAddressRequest,
        options?: RequestOptions
    ): Promise<operations.AddAddressResponse> {
        const input$ = request;

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.AddAddressRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = encodeJSON$("body", payload$.UnifiedAddressInput, { explode: true });

        const path$ = this.templateURLComponent("/accounting/address")();

        const query$ = encodeFormQuery$({
            remote_data: payload$.remote_data,
        });

        const headers$ = new Headers({
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-connection-token": encodeSimple$(
                "x-connection-token",
                payload$["x-connection-token"],
                { explode: false, charEncoding: "none" }
            ),
        });

        let security$;
        if (typeof this.options$.jwt === "function") {
            security$ = { jwt: await this.options$.jwt() };
        } else if (this.options$.jwt) {
            security$ = { jwt: this.options$.jwt };
        } else {
            security$ = {};
        }
        const context = {
            operationID: "addAddress",
            oAuth2Scopes: [],
            securitySource: this.options$.jwt,
        };
        const securitySettings$ = this.resolveGlobalSecurity(security$);

        const request$ = this.createRequest$(
            context,
            {
                security: securitySettings$,
                method: "POST",
                path: path$,
                headers: headers$,
                query: query$,
                body: body$,
            },
            options
        );

        const response = await this.do$(request$, { context, errorCodes: ["4XX", "5XX"] });

        const [result$] = await this.matcher<operations.AddAddressResponse>()
            .json(200, operations.AddAddressResponse$)
            .json(201, operations.AddAddressResponse$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }

    /**
     * Retrieve a Address
     *
     * @remarks
     * Retrieve a address from any connected Accounting software
     */
    async getAddress(
        request: operations.GetAddressRequest,
        options?: RequestOptions
    ): Promise<operations.GetAddressResponseBody> {
        const input$ = request;

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetAddressRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const pathParams$ = {
            id: encodeSimple$("id", payload$.id, { explode: false, charEncoding: "percent" }),
        };
        const path$ = this.templateURLComponent("/accounting/address/{id}")(pathParams$);

        const query$ = encodeFormQuery$({
            remote_data: payload$.remote_data,
        });

        const headers$ = new Headers({
            Accept: "application/json",
        });

        let security$;
        if (typeof this.options$.jwt === "function") {
            security$ = { jwt: await this.options$.jwt() };
        } else if (this.options$.jwt) {
            security$ = { jwt: this.options$.jwt };
        } else {
            security$ = {};
        }
        const context = {
            operationID: "getAddress",
            oAuth2Scopes: [],
            securitySource: this.options$.jwt,
        };
        const securitySettings$ = this.resolveGlobalSecurity(security$);

        const request$ = this.createRequest$(
            context,
            {
                security: securitySettings$,
                method: "GET",
                path: path$,
                headers: headers$,
                query: query$,
                body: body$,
            },
            options
        );

        const response = await this.do$(request$, { context, errorCodes: ["4XX", "5XX"] });

        const [result$] = await this.matcher<operations.GetAddressResponseBody>()
            .json(200, operations.GetAddressResponseBody$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }
}

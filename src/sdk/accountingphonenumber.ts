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

export class AccountingPhonenumber extends ClientSDK {
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
     * List a batch of PhoneNumbers
     */
    async getPhoneNumbers(
        request: operations.GetPhoneNumbersRequest,
        options?: RequestOptions
    ): Promise<operations.GetPhoneNumbersResponseBody> {
        const input$ = request;

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetPhoneNumbersRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const path$ = this.templateURLComponent("/accounting/phonenumber")();

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
            operationID: "getPhoneNumbers",
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

        const [result$] = await this.matcher<operations.GetPhoneNumbersResponseBody>()
            .json(200, operations.GetPhoneNumbersResponseBody$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }

    /**
     * Create a PhoneNumber
     *
     * @remarks
     * Create a phonenumber in any supported Accounting software
     */
    async addPhoneNumber(
        request: operations.AddPhoneNumberRequest,
        options?: RequestOptions
    ): Promise<operations.AddPhoneNumberResponse> {
        const input$ = request;

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.AddPhoneNumberRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = encodeJSON$("body", payload$.UnifiedPhoneNumberInput, { explode: true });

        const path$ = this.templateURLComponent("/accounting/phonenumber")();

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
            operationID: "addPhoneNumber",
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

        const [result$] = await this.matcher<operations.AddPhoneNumberResponse>()
            .json(200, operations.AddPhoneNumberResponse$)
            .json(201, operations.AddPhoneNumberResponse$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }

    /**
     * Retrieve a PhoneNumber
     *
     * @remarks
     * Retrieve a phonenumber from any connected Accounting software
     */
    async getPhoneNumber(
        request: operations.GetPhoneNumberRequest,
        options?: RequestOptions
    ): Promise<operations.GetPhoneNumberResponseBody> {
        const input$ = request;

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetPhoneNumberRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const pathParams$ = {
            id: encodeSimple$("id", payload$.id, { explode: false, charEncoding: "percent" }),
        };
        const path$ = this.templateURLComponent("/accounting/phonenumber/{id}")(pathParams$);

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
            operationID: "getPhoneNumber",
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

        const [result$] = await this.matcher<operations.GetPhoneNumberResponseBody>()
            .json(200, operations.GetPhoneNumberResponseBody$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }
}

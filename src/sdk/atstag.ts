/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { SDKHooks } from "../hooks/hooks.js";
import { SDK_METADATA, SDKOptions, serverURLFromOptions } from "../lib/config.js";
import {
    encodeFormQuery as encodeFormQuery$,
    encodeJSON as encodeJSON$,
    encodeSimple as encodeSimple$,
} from "../lib/encodings.js";
import { HTTPClient } from "../lib/http.js";
import * as schemas$ from "../lib/schemas.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as operations from "../models/operations/index.js";

export class AtsTag extends ClientSDK {
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
     * List a batch of Tags
     */
    async getAtsTags(
        request: operations.GetAtsTagsRequest,
        options?: RequestOptions
    ): Promise<operations.GetAtsTagsResponseBody> {
        const input$ = request;
        const headers$ = new Headers();
        headers$.set("user-agent", SDK_METADATA.userAgent);
        headers$.set("Accept", "application/json");

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetAtsTagsRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const path$ = this.templateURLComponent("/ats/tag")();

        const query$ = encodeFormQuery$({
            remote_data: payload$.remote_data,
        });

        headers$.set(
            "x-connection-token",
            encodeSimple$("x-connection-token", payload$["x-connection-token"], {
                explode: false,
                charEncoding: "none",
            })
        );

        let security$;
        if (typeof this.options$.jwt === "function") {
            security$ = { jwt: await this.options$.jwt() };
        } else if (this.options$.jwt) {
            security$ = { jwt: this.options$.jwt };
        } else {
            security$ = {};
        }
        const context = {
            operationID: "getAtsTags",
            oAuth2Scopes: [],
            securitySource: this.options$.jwt,
        };
        const securitySettings$ = this.resolveGlobalSecurity(security$);

        const doOptions = { context, errorCodes: ["4XX", "5XX"] };
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

        const response = await this.do$(request$, doOptions);

        const [result$] = await this.matcher<operations.GetAtsTagsResponseBody>()
            .json(200, operations.GetAtsTagsResponseBody$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }

    /**
     * Create a Tag
     *
     * @remarks
     * Create a tag in any supported Ats software
     */
    async addTag(
        request: operations.AddTagRequest,
        options?: RequestOptions
    ): Promise<operations.AddTagResponse> {
        const input$ = request;
        const headers$ = new Headers();
        headers$.set("user-agent", SDK_METADATA.userAgent);
        headers$.set("Content-Type", "application/json");
        headers$.set("Accept", "application/json");

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.AddTagRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = encodeJSON$("body", payload$.UnifiedTagInput, { explode: true });

        const path$ = this.templateURLComponent("/ats/tag")();

        const query$ = encodeFormQuery$({
            remote_data: payload$.remote_data,
        });

        headers$.set(
            "x-connection-token",
            encodeSimple$("x-connection-token", payload$["x-connection-token"], {
                explode: false,
                charEncoding: "none",
            })
        );

        let security$;
        if (typeof this.options$.jwt === "function") {
            security$ = { jwt: await this.options$.jwt() };
        } else if (this.options$.jwt) {
            security$ = { jwt: this.options$.jwt };
        } else {
            security$ = {};
        }
        const context = {
            operationID: "addTag",
            oAuth2Scopes: [],
            securitySource: this.options$.jwt,
        };
        const securitySettings$ = this.resolveGlobalSecurity(security$);

        const doOptions = { context, errorCodes: ["4XX", "5XX"] };
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

        const response = await this.do$(request$, doOptions);

        const [result$] = await this.matcher<operations.AddTagResponse>()
            .json(200, operations.AddTagResponse$)
            .json(201, operations.AddTagResponse$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }

    /**
     * Retrieve a Tag
     *
     * @remarks
     * Retrieve a tag from any connected Ats software
     */
    async getAtsTag(
        request: operations.GetAtsTagRequest,
        options?: RequestOptions
    ): Promise<operations.GetAtsTagResponseBody> {
        const input$ = request;
        const headers$ = new Headers();
        headers$.set("user-agent", SDK_METADATA.userAgent);
        headers$.set("Accept", "application/json");

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetAtsTagRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const pathParams$ = {
            id: encodeSimple$("id", payload$.id, { explode: false, charEncoding: "percent" }),
        };
        const path$ = this.templateURLComponent("/ats/tag/{id}")(pathParams$);

        const query$ = encodeFormQuery$({
            remote_data: payload$.remote_data,
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
            operationID: "getAtsTag",
            oAuth2Scopes: [],
            securitySource: this.options$.jwt,
        };
        const securitySettings$ = this.resolveGlobalSecurity(security$);

        const doOptions = { context, errorCodes: ["4XX", "5XX"] };
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

        const response = await this.do$(request$, doOptions);

        const [result$] = await this.matcher<operations.GetAtsTagResponseBody>()
            .json(200, operations.GetAtsTagResponseBody$)
            .fail(["4XX", "5XX"])
            .match(response);

        return result$;
    }
}

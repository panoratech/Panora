/*
 * Code generated by Speakeasy (https://speakeasyapi.dev). DO NOT EDIT.
 */

import { SDKHooks } from "../hooks/hooks.js";
import { SDK_METADATA, SDKOptions, serverURLFromOptions } from "../lib/config.js";
import {
    encodeFormQuery as encodeFormQuery$,
    encodeJSON as encodeJSON$,
} from "../lib/encodings.js";
import { HTTPClient } from "../lib/http.js";
import * as schemas$ from "../lib/schemas.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import * as operations from "../models/operations/index.js";

export class ProjectConnectors extends ClientSDK {
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
     * Update Connectors for a project
     */
    async updateConnectorsToProject(
        request: components.ProjectConnectorsDto,
        options?: RequestOptions
    ): Promise<operations.UpdateConnectorsToProjectResponse> {
        const input$ = request;
        const headers$ = new Headers();
        headers$.set("user-agent", SDK_METADATA.userAgent);
        headers$.set("Content-Type", "application/json");
        headers$.set("Accept", "*/*");

        const payload$ = schemas$.parse(
            input$,
            (value$) => components.ProjectConnectorsDto$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = encodeJSON$("body", payload$, { explode: true });

        const path$ = this.templateURLComponent("/project-connectors")();

        const query$ = "";

        let security$;
        if (typeof this.options$.jwt === "function") {
            security$ = { jwt: await this.options$.jwt() };
        } else if (this.options$.jwt) {
            security$ = { jwt: this.options$.jwt };
        } else {
            security$ = {};
        }
        const context = {
            operationID: "updateConnectorsToProject",
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

        const responseFields$ = {
            HttpMeta: { Response: response, Request: request$ },
        };

        const [result$] = await this.matcher<operations.UpdateConnectorsToProjectResponse>()
            .void(201, operations.UpdateConnectorsToProjectResponse$)
            .fail(["4XX", "5XX"])
            .match(response, request$, { extraFields: responseFields$ });

        return result$;
    }

    /**
     * Retrieve connectors by Project Id
     */
    async getConnectorsFromProject(
        request: operations.GetConnectorsFromProjectRequest,
        options?: RequestOptions
    ): Promise<operations.GetConnectorsFromProjectResponse> {
        const input$ = request;
        const headers$ = new Headers();
        headers$.set("user-agent", SDK_METADATA.userAgent);
        headers$.set("Accept", "*/*");

        const payload$ = schemas$.parse(
            input$,
            (value$) => operations.GetConnectorsFromProjectRequest$.outboundSchema.parse(value$),
            "Input validation failed"
        );
        const body$ = null;

        const path$ = this.templateURLComponent("/project-connectors")();

        const query$ = encodeFormQuery$({
            getConnectorsFromProject: payload$.getConnectorsFromProject,
            projectId: payload$.projectId,
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
            operationID: "getConnectorsFromProject",
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

        const responseFields$ = {
            HttpMeta: { Response: response, Request: request$ },
        };

        const [result$] = await this.matcher<operations.GetConnectorsFromProjectResponse>()
            .void(200, operations.GetConnectorsFromProjectResponse$)
            .fail(["4XX", "5XX"])
            .match(response, request$, { extraFields: responseFields$ });

        return result$;
    }
}

export interface Lib {
    "/crm": {},
    "/crm/{crmId}": {}
}

export type Path = (path: keyof Lib) => void;

export declare function PanoraApiClient(): {
    path: Path;
};


const client = PanoraApiClient().path("/crm/{crmId}")
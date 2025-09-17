/** AWS-SPEC: $input Provider | OWNER: vela | STATUS: READY */
export interface InputProvider {
    body(): string;
    bodyBytes(): Uint8Array;
    json(path?: string): any;
    params(): Record<string, string>;
    param(name: string): string;
    header(name: string): string;
    headers(): Record<string, string>;
    path(name: string): string;
    paths(): Record<string, string>;
    querystring(name: string): string;
    querystrings(): Record<string, string>;
}
export interface ApiGatewayEvent {
    body?: string;
    headers?: Record<string, string>;
    pathParameters?: Record<string, string>;
    queryStringParameters?: Record<string, string>;
    multiValueHeaders?: Record<string, string[]>;
    multiValueQueryStringParameters?: Record<string, string[]>;
    requestContext?: any;
    httpMethod?: string;
    path?: string;
    resource?: string;
    stage?: string;
    stageVariables?: Record<string, string>;
}
export declare function createInputProvider(event: ApiGatewayEvent): InputProvider;

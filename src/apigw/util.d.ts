/** AWS-SPEC: $util Provider | OWNER: vela | STATUS: READY */
export interface UtilProvider {
    json(value: any): string;
    parseJson(jsonString: string): any;
    toJson(value: any): string;
    base64Encode(value: string): string;
    base64Decode(value: string): string;
    urlEncode(value: string): string;
    urlDecode(value: string): string;
    escapeJavaScript(value: string): string;
    time: {
        nowISO8601(): string;
        epochMilli(): number;
        epochSecond(): number;
        format(template: string, time?: Date): string;
    };
    qr(value: any): string;
    error(message: string, statusCode?: number): never;
    appendError(message: string, statusCode?: number): void;
    abort(message: string, statusCode?: number): never;
}
export declare function createUtilProvider(): UtilProvider;

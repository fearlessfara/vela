export interface ResourceLoader {
    init(configuration: Map<string, any>): void;
    getResourceAsString(name: string, encoding?: string): Promise<string>;
    getResourceAsStringSync(name: string, encoding?: string): string;
    resourceExists(name: string): boolean;
    getLastModified(name: string): number;
    isCachingEnabled(): boolean;
}
export declare class FileResourceLoader implements ResourceLoader {
    private paths;
    private cachingEnabled;
    private encoding;
    init(configuration: Map<string, any>): void;
    getResourceAsString(name: string, encoding?: string): Promise<string>;
    getResourceAsStringSync(name: string, encoding?: string): string;
    resourceExists(name: string): boolean;
    getLastModified(name: string): number;
    isCachingEnabled(): boolean;
    addPath(searchPath: string): void;
    getPaths(): string[];
    private findResource;
}
export declare class StringResourceLoader implements ResourceLoader {
    private resources;
    private cachingEnabled;
    init(configuration: Map<string, any>): void;
    getResourceAsString(name: string, encoding?: string): Promise<string>;
    getResourceAsStringSync(name: string, encoding?: string): string;
    resourceExists(name: string): boolean;
    getLastModified(name: string): number;
    isCachingEnabled(): boolean;
    putStringResource(name: string, content: string): void;
    removeStringResource(name: string): boolean;
    clearStringResources(): void;
}

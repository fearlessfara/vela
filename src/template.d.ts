import { VtlParser } from './parser/vtlParser.js';
import { EvaluationContext } from './runtime/evaluator.js';
import { ResourceLoader } from './resource/resourceLoader.js';
import type { SpaceGobblingMode } from './engine.js';
export declare const RESOURCE_TEMPLATE = "template";
export declare class Template {
    private name;
    private encoding;
    private resourceLoader;
    private data;
    private lastModified;
    private spaceGobbling;
    private parser;
    private errorCondition;
    constructor(name: string, encoding?: string, spaceGobbling?: SpaceGobblingMode);
    getName(): string;
    getEncoding(): string;
    setResourceLoader(loader: ResourceLoader): void;
    getLastModified(): number;
    process(): Promise<boolean>;
    processSync(): boolean;
    merge(context?: EvaluationContext): string;
    isProcessed(): boolean;
    getData(): any;
}

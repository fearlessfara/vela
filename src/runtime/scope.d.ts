/** AWS-SPEC: Runtime Scope | OWNER: vela | STATUS: READY */
export interface Scope {
    variables: Map<string, any>;
    parent?: Scope;
}
export interface MacroDefinition {
    name: string;
    parameters: string[];
    body: any;
}
export declare class ScopeManager {
    private currentScope;
    private macroTable;
    constructor();
    setVariable(name: string, value: any): void;
    getVariable(name: string): any;
    hasVariable(name: string): boolean;
    pushScope(): void;
    popScope(): void;
    defineMacro(name: string, parameters: string[], body: any): void;
    getMacro(name: string): MacroDefinition | undefined;
    hasMacro(name: string): boolean;
    clear(): void;
}

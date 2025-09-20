/** AWS-SPEC: Runtime Scope | OWNER: vela | STATUS: READY */

// APIGW:Runtime Scope

export interface Scope {
  variables: Map<string, any>;
  parent?: Scope;
  depth: number;
  scopeType?: 'global' | 'foreach' | 'macro' | 'local';
  iteratorContext?: ForeachIteratorContext;
}

export interface ForeachIteratorContext {
  depth: number;
  variableName: string;
  iteratorVariableName: string;
  velocityCountVariableName: string;
  parentIteratorContext?: ForeachIteratorContext | undefined;
}

export interface MacroDefinition {
  name: string;
  parameters: string[];
  body: any; // AST nodes
}

export class ScopeManager {
  private currentScope: Scope;
  private macroTable: Map<string, MacroDefinition>;
  private foreachDepth: number;

  constructor() {
    this.currentScope = {
      variables: new Map(),
      depth: 0,
      scopeType: 'global'
    };
    this.macroTable = new Map();
    this.foreachDepth = 0;
  }

  // Variable operations
  setVariable(name: string, value: any): void {
    this.currentScope.variables.set(name, value);
  }

  getVariable(name: string): any {
    let scope: Scope | undefined = this.currentScope;
    while (scope) {
      if (scope.variables.has(name)) {
        return scope.variables.get(name);
      }
      scope = scope.parent;
    }
    return undefined;
  }

  hasVariable(name: string): boolean {
    let scope: Scope | undefined = this.currentScope;
    while (scope) {
      if (scope.variables.has(name)) {
        return true;
      }
      scope = scope.parent;
    }
    return false;
  }

  // Scope management
  pushScope(scopeType: 'global' | 'foreach' | 'macro' | 'local' = 'local'): void {
    const newScope: Scope = {
      variables: new Map(),
      parent: this.currentScope,
      depth: this.currentScope.depth + 1,
      scopeType: scopeType,
    };
    this.currentScope = newScope;
  }

  pushForeachScope(variableName: string, iteratorVariableName: string = 'foreach', velocityCountVariableName: string = 'velocityCount'): void {
    this.foreachDepth++;
    const parentIteratorContext = this.getCurrentForeachContext();
    
    const iteratorContext: ForeachIteratorContext = {
      depth: this.foreachDepth,
      variableName: variableName,
      iteratorVariableName: iteratorVariableName,
      velocityCountVariableName: velocityCountVariableName,
      parentIteratorContext: parentIteratorContext
    };

    const newScope: Scope = {
      variables: new Map(),
      parent: this.currentScope,
      depth: this.currentScope.depth + 1,
      scopeType: 'foreach',
      iteratorContext: iteratorContext,
    };
    this.currentScope = newScope;
  }

  popScope(): void {
    if (this.currentScope.parent) {
      if (this.currentScope.scopeType === 'foreach') {
        this.foreachDepth--;
      }
      this.currentScope = this.currentScope.parent;
    }
  }

  getCurrentForeachContext(): ForeachIteratorContext | undefined {
    let scope: Scope | undefined = this.currentScope;
    while (scope) {
      if (scope.scopeType === 'foreach' && scope.iteratorContext) {
        return scope.iteratorContext;
      }
      scope = scope.parent;
    }
    return undefined;
  }

  getForeachDepth(): number {
    return this.foreachDepth;
  }

  getScopeDepth(): number {
    return this.currentScope.depth;
  }

  // Macro operations (stub)
  defineMacro(name: string, parameters: string[], body: any): void {
    this.macroTable.set(name, { name, parameters, body });
  }

  getMacro(name: string): MacroDefinition | undefined {
    return this.macroTable.get(name);
  }

  hasMacro(name: string): boolean {
    return this.macroTable.has(name);
  }

  // Clear all state
  clear(): void {
    this.currentScope = {
      variables: new Map(),
      depth: 0,
      scopeType: 'global'
    };
    this.macroTable.clear();
    this.foreachDepth = 0;
  }
}

/* Deviation Report: None - Scope management matches AWS API Gateway VTL specification */

/** Apache Velocity: Runtime Scope | OWNER: vela | STATUS: READY */

// Apache Velocity: Runtime Scope

export interface Scope {
  variables: Map<string, any>;
  parent?: Scope;
}

export interface MacroDefinition {
  name: string;
  parameters: string[];
  body: any; // AST nodes
}

export class ScopeManager {
  private currentScope: Scope;
  private macroTable: Map<string, MacroDefinition>;

  constructor() {
    this.currentScope = { variables: new Map() };
    this.macroTable = new Map();
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
  pushScope(): void {
    const newScope: Scope = {
      variables: new Map(),
      parent: this.currentScope,
    };
    this.currentScope = newScope;
  }

  popScope(): void {
    if (this.currentScope.parent) {
      this.currentScope = this.currentScope.parent;
    }
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
    this.currentScope = { variables: new Map() };
    this.macroTable.clear();
  }
}

/* Apache Velocity Runtime Scope - Matches Java reference implementation */

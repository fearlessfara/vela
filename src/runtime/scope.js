/** Apache Velocity: Runtime Scope | OWNER: vela | STATUS: READY */
export class ScopeManager {
    currentScope;
    macroTable;
    constructor() {
        this.currentScope = { variables: new Map() };
        this.macroTable = new Map();
    }
    // Variable operations
    setVariable(name, value) {
        this.currentScope.variables.set(name, value);
    }
    getVariable(name) {
        let scope = this.currentScope;
        while (scope) {
            if (scope.variables.has(name)) {
                return scope.variables.get(name);
            }
            scope = scope.parent;
        }
        return undefined;
    }
    hasVariable(name) {
        let scope = this.currentScope;
        while (scope) {
            if (scope.variables.has(name)) {
                return true;
            }
            scope = scope.parent;
        }
        return false;
    }
    // Scope management
    pushScope() {
        const newScope = {
            variables: new Map(),
            parent: this.currentScope,
        };
        this.currentScope = newScope;
    }
    popScope() {
        if (this.currentScope.parent) {
            this.currentScope = this.currentScope.parent;
        }
    }
    // Macro operations (stub)
    defineMacro(name, parameters, body) {
        this.macroTable.set(name, { name, parameters, body });
    }
    getMacro(name) {
        return this.macroTable.get(name);
    }
    hasMacro(name) {
        return this.macroTable.has(name);
    }
    // Clear all state
    clear() {
        this.currentScope = { variables: new Map() };
        this.macroTable.clear();
    }
}

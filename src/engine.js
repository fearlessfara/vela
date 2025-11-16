/** Apache Velocity: Velocity Engine | OWNER: vela | STATUS: READY */
import { VtlParser } from './parser/vtlParser.js';
import { cstToAst } from './parser/cstToAst.js';
import { VtlEvaluator } from './runtime/evaluator.js';
export class VelocityEngine {
    parser;
    constructor(debugMode = false) {
        this.parser = new VtlParser(debugMode);
    }
    render(template, context = {}) {
        try {
            // Parse the template
            const parseResult = this.parser.parse(template);
            if (parseResult.errors && parseResult.errors.length > 0) {
                const errorMessages = parseResult.errors.map((e) => e.message).join('; ');
                throw new Error(`Template parsing failed: ${errorMessages}`);
            }
            // Convert CST to AST
            if (!parseResult.cst) {
                throw new Error('Failed to parse template');
            }
            const ast = cstToAst(parseResult.cst);
            // Evaluate the template
            const evaluator = new VtlEvaluator(context);
            const output = evaluator.evaluateTemplate(ast);
            return output;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}
// Convenience function for simple template rendering
export function renderTemplate(template, context = {}, debugMode = false) {
    const engine = new VelocityEngine(debugMode);
    return engine.render(template, context);
}

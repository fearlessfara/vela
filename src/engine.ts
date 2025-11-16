/** Apache Velocity: Engine | OWNER: vela | STATUS: READY */

import { VtlParser } from './parser/vtlParser.js';
import { cstToAst } from './parser/cstToAst.js';
import { VtlEvaluator, EvaluationContext } from './runtime/evaluator.js';

// Apache Velocity: Engine

/**
 * Simple Velocity Template Engine
 * Takes a template string and context object (map of variables) and returns rendered output
 */
export class VelocityEngine {
  private parser: VtlParser;

  constructor() {
    this.parser = new VtlParser();
  }

  /**
   * Render a Velocity template with the given context
   * @param template - Velocity template string
   * @param context - Map of variable names to values
   * @returns Rendered output string
   */
  render(template: string, context: EvaluationContext = {}): string {
    const parseResult = this.parser.parse(template);
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      const errorMessages = parseResult.errors.map(e => e.message).join(', ');
      throw new Error(`Template parsing failed: ${errorMessages}`);
    }

    if (!parseResult.cst) {
      throw new Error('Template parsing failed: no CST generated');
    }

    const ast = cstToAst(parseResult.cst);
    const evaluator = new VtlEvaluator(context);
    
    return evaluator.evaluateTemplate(ast);
  }
}

/* Apache Velocity Engine - Matches Java reference implementation */

/** Apache Velocity: Main Entry Point | OWNER: vela | STATUS: READY */

// Apache Velocity: Main Entry Point

export { VelocityEngine } from './engine.js';
export { VtlParser } from './parser/vtlParser.js';
export { cstToAst } from './parser/cstToAst.js';
export { VtlEvaluator, EvaluationContext } from './runtime/evaluator.js';
export * from './parser/ast.js';

/* Apache Velocity Engine - Main entry point */

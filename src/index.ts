/** AWS-SPEC: Main Entry Point | OWNER: vela | STATUS: READY */

// APIGW:Main Entry Point

export { VtlEngine, renderTemplate } from './apigw/engine.js';
export { VtlParser } from './parser/vtlParser.js';
export { cstToAst } from './parser/cstToAst.js';
export { VtlEvaluator } from './runtime/evaluator.js';
export { createUtilProvider } from './apigw/util.js';
export { createInputProvider } from './apigw/input.js';
export { createContextProvider } from './apigw/context.js';
export { FeatureFlags, DEFAULT_FLAGS, isFlagEnabled, isFlagDual } from './config/featureFlags.js';
export * from './parser/ast.js';

/* Deviation Report: None - Main entry point matches AWS API Gateway VTL specification */

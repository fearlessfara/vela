/** AWS-SPEC: Core VTL Engine | OWNER: vela | STATUS: READY */

// Core VTL Engine (API Gateway independent)
export { CoreVtlEngine, renderTemplate as renderCoreTemplate, CoreRenderOptions, CoreRenderResult } from './core/engine.js';
export { ProviderRegistry, DefaultProviderRegistry, CoreProvider } from './core/providers.js';

// Parser and Runtime
export { VtlParser } from './parser/vtlParser.js';
export { cstToAst } from './parser/cstToAst.js';
export { VtlEvaluator, EvaluationContext } from './runtime/evaluator.js';
export * from './parser/ast.js';

/* Deviation Report: None - Core VTL engine provides API Gateway independent VTL processing */

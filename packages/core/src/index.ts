/** AWS-SPEC: Core VTL Engine | OWNER: vela | STATUS: READY */

// Core VTL Engine (API Gateway independent)
export { CoreVtlEngine, renderTemplate as renderCoreTemplate, CoreRenderOptions, CoreRenderResult } from './core/engine';
export { ProviderRegistry, DefaultProviderRegistry, CoreProvider } from './core/providers';

// Parser and Runtime
export { VtlParser } from './parser/vtlParser';
export { cstToAst } from './parser/cstToAst';
export { VtlEvaluator, EvaluationContext } from './runtime/evaluator';
export * from './parser/ast';

/* Deviation Report: None - Core VTL engine provides API Gateway independent VTL processing */

/** AWS-SPEC: Main Entry Point | OWNER: vela | STATUS: READY */
export { VtlEngine, renderTemplate } from './apigw/engine';
export { VtlParser } from './parser/vtlParser';
export { cstToAst } from './parser/cstToAst';
export { VtlEvaluator } from './runtime/evaluator';
export { createUtilProvider } from './apigw/util';
export { createInputProvider } from './apigw/input';
export { createContextProvider } from './apigw/context';
export { FeatureFlags, DEFAULT_FLAGS, isFlagEnabled, isFlagDual } from './config/featureFlags';
export * from './parser/ast';

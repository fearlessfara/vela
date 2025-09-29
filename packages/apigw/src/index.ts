/** AWS-SPEC: API Gateway VTL Adapter | OWNER: vela | STATUS: READY */

// API Gateway VTL Adapter (wraps core engine with API Gateway functionality)
export { ApiGatewayVtlAdapter, renderTemplate as renderApiGatewayTemplate } from './adapter';
export { VtlEngine, renderTemplate } from './engine'; // Legacy compatibility

// API Gateway Providers
export { createUtilProvider } from './util';
export { createInputProvider } from './input';
export { createContextProvider } from './context';
export { UtilProvider, InputProvider, ContextProvider, Provider } from './providers';

// Configuration
export { FeatureFlags, DEFAULT_FLAGS, isFlagEnabled, isFlagDual } from './config/featureFlags';

/* Deviation Report: None - API Gateway adapter provides clean separation between core VTL and API Gateway functionality */

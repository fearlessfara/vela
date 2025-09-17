/**
 * Browser-compatible entry point for Vela VTL Engine
 * AWS-SPEC: N/A | OWNER: fearlessfara | STATUS: READY
 */

// Import polyfills first
import './compat/browser-polyfills.js';

// Re-export all the main functionality
export * from './index.js';

// Browser-specific exports
export { createUtilProvider as createBrowserUtilProvider } from './compat/util-browser.js';

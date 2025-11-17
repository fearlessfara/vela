/** Apache Velocity: Velocity Engine | OWNER: vela | STATUS: READY */

import { VtlParser } from './parser/vtlParser.js';
import { cstToAst } from './parser/cstToAst.js';
import { VtlEvaluator, EvaluationContext } from './runtime/evaluator.js';

/**
 * Space gobbling modes (matches Java RuntimeConstants.SpaceGobbling enum)
 */
export type SpaceGobblingMode = 'none' | 'bc' | 'lines' | 'structured';

/**
 * Configuration options for the VelocityEngine
 */
export interface VelocityEngineConfig {
  /** Enable debug mode for detailed parsing information */
  debugMode?: boolean;
  /** String interning for performance optimization */
  stringInterning?: boolean;
  /** Scope name for evaluate() calls */
  evaluateScopeName?: string;
  /** Custom application attributes */
  applicationAttributes?: Map<string, any>;
  /**
   * Space gobbling mode (default: 'lines')
   * - none: No space gobbling
   * - bc: Backward compatibility mode
   * - lines: Line directives gobble trailing newlines
   * - structured: Advanced structured gobbling
   */
  spaceGobbling?: SpaceGobblingMode;
}

/**
 * Parse error thrown when template parsing fails
 */
export class ParseErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseErrorException';
  }
}

/**
 * Resource not found exception
 */
export class ResourceNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundException';
  }
}

/**
 * Method invocation exception
 */
export class MethodInvocationException extends Error {
  declare readonly cause: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'MethodInvocationException';
    this.cause = cause;
  }
}

/**
 * VelocityEngine - TypeScript port of Apache Velocity Engine
 *
 * This class provides the main interface for rendering Velocity templates.
 * It follows the same architecture as the Java implementation, with a
 * RuntimeInstance-like internal configuration system.
 */
export class VelocityEngine {
  private parser: VtlParser;
  private config: VelocityEngineConfig;
  private properties: Map<string, any>;
  private initialized: boolean;

  /**
   * Creates a new VelocityEngine instance
   * @param config Optional configuration object
   */
  constructor(config?: VelocityEngineConfig) {
    this.config = {
      debugMode: false,
      stringInterning: false,
      evaluateScopeName: 'evaluate',
      spaceGobbling: 'lines', // Default to 'lines' mode like Java
      applicationAttributes: new Map(),
      ...config
    };
    this.properties = new Map();
    this.initialized = false;
    this.parser = new VtlParser(this.config.debugMode || false);
  }

  /**
   * Initialize the engine (for compatibility with Java API)
   */
  init(): void {
    this.initialized = true;
  }

  /**
   * Reset the engine instance
   */
  reset(): void {
    this.initialized = false;
    this.properties.clear();
    this.parser = new VtlParser(this.config.debugMode || false);
  }

  /**
   * Set a runtime property
   * @param key Property key
   * @param value Property value
   */
  setProperty(key: string, value: any): void {
    this.properties.set(key, value);
  }

  /**
   * Get a runtime property
   * @param key Property key
   * @returns Property value or undefined
   */
  getProperty(key: string): any {
    return this.properties.get(key);
  }

  /**
   * Clear a runtime property
   * @param key Property key
   */
  clearProperty(key: string): void {
    this.properties.delete(key);
  }

  /**
   * Set application attribute (for cross-component communication)
   * @param key Attribute key
   * @param value Attribute value
   */
  setApplicationAttribute(key: string, value: any): void {
    this.config.applicationAttributes?.set(key, value);
  }

  /**
   * Get application attribute
   * @param key Attribute key
   * @returns Attribute value or undefined
   */
  getApplicationAttribute(key: string): any {
    return this.config.applicationAttributes?.get(key);
  }

  /**
   * Main rendering method - evaluates a template string with the given context
   *
   * @param template The VTL template string to render
   * @param context Context object containing variables for template evaluation
   * @returns Rendered output string
   * @throws ParseErrorException if template parsing fails
   * @throws MethodInvocationException if method invocation fails during evaluation
   */
  render(template: string, context: EvaluationContext = {}): string {
    return this.evaluate(context, template);
  }

  /**
   * Evaluates a template string with the given context (Java API compatible)
   *
   * @param context Context object containing data for rendering
   * @param template The VTL template string to evaluate
   * @param _logTag Optional tag for logging (for compatibility, currently unused)
   * @returns Rendered output string
   * @throws ParseErrorException if template parsing fails
   */
  evaluate(context: EvaluationContext, template: string, _logTag?: string): string {
    try {
      // Auto-initialize if needed (like Java implementation)
      if (!this.initialized) {
        this.init();
      }

      // Parse the template
      const parseResult = this.parser.parse(template);

      // Check for fatal parse errors
      // Note: Chevrotain may accumulate errors from backtracking attempts in OR rules,
      // but if a CST was successfully generated, the parse succeeded
      if (!parseResult.cst) {
        if (parseResult.errors && parseResult.errors.length > 0) {
          const errorMessages = parseResult.errors.map((e: any) => e.message).join('; ');
          throw new ParseErrorException(`Template parsing failed: ${errorMessages}`);
        }
        throw new ParseErrorException('Failed to parse template');
      }

      const ast = cstToAst(parseResult.cst, this.config.spaceGobbling || 'lines');

      // Evaluate the template
      const evaluator = new VtlEvaluator(context, this.config.spaceGobbling || 'lines');
      const output = evaluator.evaluateTemplate(ast);

      return output;
    } catch (error) {
      if (error instanceof ParseErrorException) {
        throw error;
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Merge a template with context (Java API compatible method name)
   * This is an alias for render() to match Java API
   *
   * @param template Template string
   * @param context Context object
   * @returns Rendered output
   */
  mergeTemplate(template: string, context: EvaluationContext = {}): string {
    return this.render(template, context);
  }
}

/**
 * Convenience function for simple template rendering
 * @param template VTL template string
 * @param context Context object with variables
 * @param debugMode Enable debug mode
 * @returns Rendered output string
 */
export function renderTemplate(template: string, context: EvaluationContext = {}, debugMode: boolean = false): string {
  const engine = new VelocityEngine({ debugMode });
  return engine.render(template, context);
}

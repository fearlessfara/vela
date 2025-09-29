/** AWS-SPEC: Core VTL Engine Tests | OWNER: vela | STATUS: READY */

// APIGW:Core VTL Engine Tests

import { CoreVtlEngine, renderTemplate as renderCoreTemplate } from '../src/core/engine';
import { DefaultProviderRegistry } from '../src/core/providers';

describe('CoreVtlEngine', () => {
  it('evaluates basic VTL templates without providers', () => {
    const engine = new CoreVtlEngine();
    const template = 'Hello World!';
    
    const result = engine.renderTemplate({
      template
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Hello World!');
  });

  it('evaluates VTL templates with text segments', () => {
    const engine = new CoreVtlEngine();
    const template = 'Hello World! This is a test.';
    
    const result = engine.renderTemplate({
      template
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Hello World! This is a test.');
  });

  it('handles empty templates', () => {
    const engine = new CoreVtlEngine();
    const template = '';
    
    const result = engine.renderTemplate({
      template
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('');
  });

  it('handles whitespace-only templates', () => {
    const engine = new CoreVtlEngine();
    const template = '   \n\t   ';
    
    const result = engine.renderTemplate({
      template
    });

    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.output).toMatch(/^[\s\n\t]*$/);
    expect(result.output.includes('\n')).toBe(true);
  });

  it('handles malformed directives gracefully (no crash)', () => {
    const engine = new CoreVtlEngine();
    const template = '#if($cond) missing end';

    const result = engine.renderTemplate({ template });
    expect(Array.isArray(result.errors)).toBe(true);
    // Either collects parse errors or returns partial output; both acceptable here
    expect(typeof result.output).toBe('string');
  });

  it('works with custom providers registry', () => {
    const providers = new DefaultProviderRegistry();
    const engine = new CoreVtlEngine(false, providers);
    const template = 'Hello World!';
    
    const result = engine.renderTemplate({
      template,
      providers
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Hello World!');
  });

  it('convenience function works', () => {
    const template = 'Hello World!';
    
    const result = renderCoreTemplate({
      template
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Hello World!');
  });

  it('convenience function with debug mode works', () => {
    const template = 'Hello World!';
    
    const result = renderCoreTemplate({
      template
    }, true);

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('Hello World!');
  });

  it('evaluates ${} arithmetic expressions', () => {
    const tpl = '${1+2*3}';
    const r = new CoreVtlEngine().renderTemplate({ template: tpl });
    expect(r.errors).toEqual([]);
    expect(r.output).toBe('7');
  });
});

/* Deviation Report: None - Core VTL engine tests verify pure VTL functionality without API Gateway dependencies */

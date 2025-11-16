import { VelocityEngine, renderTemplate } from '../../dist/engine.js';

describe('VelocityEngine', () => {
  it('evaluates velocity templates with simple context', () => {
    const engine = new VelocityEngine();
    const template = 'Hello, $name!';
    const context = { name: 'World' };

    const output = engine.render(template, context);

    expect(output).toBe('Hello, World!');
  });

  it('renders templates with #set directive', () => {
    const engine = new VelocityEngine();
    const template = '#set($greeting = "Hello")$greeting, $name!';
    const context = { name: 'World' };

    const output = engine.render(template, context);

    expect(output).toBe('Hello, World!');
  });

  it('renders templates with #if directive', () => {
    const engine = new VelocityEngine();
    const template = '#if($show)Visible#elseHidden#end';
    const context = { show: true };

    const output = engine.render(template, context);

    expect(output).toBe('Visible');
  });

  it('renders templates with #foreach directive', () => {
    const engine = new VelocityEngine();
    const template = '#foreach($item in $items)$item #end';
    const context = { items: ['apple', 'banana', 'cherry'] };

    const output = engine.render(template, context);

    expect(output.trim()).toBe('apple banana cherry');
  });

  it('handles member access', () => {
    const engine = new VelocityEngine();
    const template = 'Name: $user.name, Age: $user.age';
    const context = { user: { name: 'Alice', age: 30 } };

    const output = engine.render(template, context);

    expect(output).toBe('Name: Alice, Age: 30');
  });

  it('handles quiet references for undefined variables', () => {
    const engine = new VelocityEngine();
    const template = 'Value: $!missing';
    const context = {};

    const output = engine.render(template, context);

    expect(output).toBe('Value: ');
  });

  it('returns parser errors for invalid templates', () => {
    const engine = new VelocityEngine();
    
    expect(() => {
      engine.render('#set($value = )', {});
    }).toThrow();
  });

  it('works with renderTemplate convenience function', () => {
    const template = 'Hello, $name!';
    const context = { name: 'World' };

    const output = renderTemplate(template, context);

    expect(output).toBe('Hello, World!');
  });
});

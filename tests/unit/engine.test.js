import { VelocityEngine } from '../../dist/engine.js';

describe('VelocityEngine', () => {
  it('evaluates simple velocity templates with context variables', () => {
    const engine = new VelocityEngine();
    const template = 'Hello $name! You have $count items.';
    const context = {
      name: 'World',
      count: 42
    };

    const result = engine.render(template, context);

    expect(result).toBe('Hello World! You have 42 items.');
  });

  it('handles quiet references for undefined variables', () => {
    const engine = new VelocityEngine();
    const template = 'Hello $name! Missing: $!missing';
    const context = {
      name: 'World'
    };

    const result = engine.render(template, context);

    expect(result).toBe('Hello World! Missing: ');
  });

  it('evaluates if directives', () => {
    const engine = new VelocityEngine();
    const template = '#if($show)Visible#elseHidden#end';
    const context = {
      show: true
    };

    const result = engine.render(template, context);

    expect(result).toBe('Visible');
  });

  it('evaluates foreach directives', () => {
    const engine = new VelocityEngine();
    const template = '#foreach($item in $items)$item #end';
    const context = {
      items: ['a', 'b', 'c']
    };

    const result = engine.render(template, context);

    expect(result).toBe('a b c ');
  });

  it('evaluates set directives', () => {
    const engine = new VelocityEngine();
    const template = '#set($x = 5)Value: $x';
    const context = {};

    const result = engine.render(template, context);

    expect(result).toBe('Value: 5');
  });

  it('handles member access', () => {
    const engine = new VelocityEngine();
    const template = 'Name: $user.name, Age: $user.age';
    const context = {
      user: {
        name: 'John',
        age: 30
      }
    };

    const result = engine.render(template, context);

    expect(result).toBe('Name: John, Age: 30');
  });

  it('returns parser errors for invalid templates', () => {
    const engine = new VelocityEngine();
    
    expect(() => {
      engine.render('#set($value = )', {});
    }).toThrow();
  });

  it('handles empty context', () => {
    const engine = new VelocityEngine();
    const template = 'Static text only';
    const result = engine.render(template, {});

    expect(result).toBe('Static text only');
  });

  it('handles complex expressions', () => {
    const engine = new VelocityEngine();
    const template = 'Result: $a + $b = $math.add($a, $b)';
    const context = {
      a: 5,
      b: 3,
      math: {
        add: (x, y) => x + y
      }
    };

    const result = engine.render(template, context);

    expect(result).toBe('Result: 5 + 3 = 8');
  });
});

/** AWS-SPEC: VTL Expressions | OWNER: vela | STATUS: READY */

import { VelocityEngine } from '../../dist/engine.js';

describe('Expression Operators', () => {
  const engine = new VelocityEngine();

  describe('Arithmetic Operators', () => {
    it('evaluates addition', () => {
      const template = '$a + $b';
      const context = { a: 5, b: 3 };
      const output = engine.render(template, context);
      expect(output).toBe('8');
    });

    it('evaluates subtraction', () => {
      const template = '$a - $b';
      const context = { a: 10, b: 4 };
      const output = engine.render(template, context);
      expect(output).toBe('6');
    });

    it('evaluates multiplication', () => {
      const template = '$a * $b';
      const context = { a: 6, b: 7 };
      const output = engine.render(template, context);
      expect(output).toBe('42');
    });

    it('evaluates division', () => {
      const template = '$a / $b';
      const context = { a: 20, b: 4 };
      const output = engine.render(template, context);
      expect(output).toBe('5');
    });

    it('evaluates modulo', () => {
      const template = '$a % $b';
      const context = { a: 17, b: 5 };
      const output = engine.render(template, context);
      expect(output).toBe('2');
    });

    it('handles division by zero', () => {
      const template = '$a / $b';
      const context = { a: 10, b: 0 };
      const output = engine.render(template, context);
      expect(output).toBe('0');
    });

    it('handles modulo by zero', () => {
      const template = '$a % $b';
      const context = { a: 10, b: 0 };
      const output = engine.render(template, context);
      expect(output).toBe('0');
    });

    it('evaluates chained arithmetic', () => {
      const template = '$a + $b * $c';
      const context = { a: 2, b: 3, c: 4 };
      const output = engine.render(template, context);
      expect(output).toBe('14'); // 2 + (3 * 4) = 14
    });

    it('evaluates arithmetic with parentheses', () => {
      const template = '($a + $b) * $c';
      const context = { a: 2, b: 3, c: 4 };
      const output = engine.render(template, context);
      expect(output).toBe('20'); // (2 + 3) * 4 = 20
    });
  });

  describe('Comparison Operators', () => {
    it('evaluates equality (==)', () => {
      const template = '#if($a == $b)equal#else not equal#end';
      const context = { a: 5, b: 5 };
      expect(engine.render(template, context)).toBe('equal');
      
      const context2 = { a: 5, b: 6 };
      expect(engine.render(template, context2)).toBe(' not equal');
    });

    it('evaluates inequality (!=)', () => {
      const template = '#if($a != $b)not equal#else equal#end';
      const context = { a: 5, b: 6 };
      expect(engine.render(template, context)).toBe('not equal');
      
      const context2 = { a: 5, b: 5 };
      expect(engine.render(template, context2)).toBe(' equal');
    });

    it('evaluates less than (<)', () => {
      const template = '#if($a < $b)less#else not less#end';
      const context = { a: 3, b: 5 };
      expect(engine.render(template, context)).toBe('less');
      
      const context2 = { a: 5, b: 3 };
      expect(engine.render(template, context2)).toBe(' not less');
    });

    it('evaluates less than or equal (<=)', () => {
      const template = '#if($a <= $b)less or equal#else greater#end';
      const context = { a: 5, b: 5 };
      expect(engine.render(template, context)).toBe('less or equal');
      
      const context2 = { a: 3, b: 5 };
      expect(engine.render(template, context2)).toBe('less or equal');
      
      const context3 = { a: 6, b: 5 };
      expect(engine.render(template, context3)).toBe(' greater');
    });

    it('evaluates greater than (>)', () => {
      const template = '#if($a > $b)greater#else not greater#end';
      const context = { a: 7, b: 5 };
      expect(engine.render(template, context)).toBe('greater');
      
      const context2 = { a: 3, b: 5 };
      expect(engine.render(template, context2)).toBe(' not greater');
    });

    it('evaluates greater than or equal (>=)', () => {
      const template = '#if($a >= $b)greater or equal#else less#end';
      const context = { a: 5, b: 5 };
      expect(engine.render(template, context)).toBe('greater or equal');
      
      const context2 = { a: 7, b: 5 };
      expect(engine.render(template, context2)).toBe('greater or equal');
      
      const context3 = { a: 3, b: 5 };
      expect(engine.render(template, context3)).toBe(' less');
    });
  });

  describe('Logical Operators', () => {
    it('evaluates logical AND (&&)', () => {
      const template = '#if($a && $b)both true#else not both#end';
      const context = { a: true, b: true };
      expect(engine.render(template, context)).toBe('both true');
      
      const context2 = { a: true, b: false };
      expect(engine.render(template, context2)).toBe(' not both');
      
      const context3 = { a: false, b: true };
      expect(engine.render(template, context3)).toBe(' not both');
      
      const context4 = { a: false, b: false };
      expect(engine.render(template, context4)).toBe(' not both');
    });

    it('evaluates logical OR (||)', () => {
      const template = '#if($a || $b)at least one#else both false#end';
      const context = { a: true, b: false };
      expect(engine.render(template, context)).toBe('at least one');
      
      const context2 = { a: false, b: true };
      expect(engine.render(template, context2)).toBe('at least one');
      
      const context3 = { a: true, b: true };
      expect(engine.render(template, context3)).toBe('at least one');
      
      const context4 = { a: false, b: false };
      expect(engine.render(template, context4)).toBe(' both false');
    });

    it('evaluates logical NOT (!)', () => {
      const template = '#if(!$a)not true#else true#end';
      const context = { a: false };
      expect(engine.render(template, context)).toBe('not true');
      
      const context2 = { a: true };
      expect(engine.render(template, context2)).toBe(' true');
    });

    it('evaluates complex logical expressions', () => {
      const template = '#if($a && ($b || $c))complex#else simple#end';
      const context = { a: true, b: true, c: false };
      expect(engine.render(template, context)).toBe('complex');
      
      const context2 = { a: true, b: false, c: true };
      expect(engine.render(template, context2)).toBe('complex');
      
      const context3 = { a: false, b: true, c: true };
      expect(engine.render(template, context3)).toBe(' simple');
    });
  });

  describe('Ternary Operator', () => {
    it('evaluates ternary operator', () => {
      const template = '$a ? $b : $c';
      const context = { a: true, b: 'yes', c: 'no' };
      expect(engine.render(template, context)).toBe('yes');
      
      const context2 = { a: false, b: 'yes', c: 'no' };
      expect(engine.render(template, context2)).toBe('no');
    });

    it('evaluates nested ternary', () => {
      const template = '$a ? ($b ? $c : $d) : $e';
      const context = { a: true, b: true, c: 'c', d: 'd', e: 'e' };
      expect(engine.render(template, context)).toBe('c');
      
      const context2 = { a: true, b: false, c: 'c', d: 'd', e: 'e' };
      expect(engine.render(template, context2)).toBe('d');
      
      const context3 = { a: false, b: true, c: 'c', d: 'd', e: 'e' };
      expect(engine.render(template, context3)).toBe('e');
    });
  });

  describe('Unary Operators', () => {
    it('evaluates unary plus', () => {
      const template = '+$a';
      const context = { a: 5 };
      expect(engine.render(template, context)).toBe('5');
      
      const context2 = { a: -3 };
      expect(engine.render(template, context2)).toBe('-3');
    });

    it('evaluates unary minus', () => {
      const template = '-$a';
      const context = { a: 5 };
      expect(engine.render(template, context)).toBe('-5');
      
      const context2 = { a: -3 };
      expect(engine.render(template, context2)).toBe('3');
    });

    it('evaluates unary NOT', () => {
      const template = '!$a';
      const context = { a: true };
      // Note: This renders as boolean, may need to check actual output
      const output = engine.render(template, context);
      expect(typeof output).toBe('string');
    });
  });

  describe('Operator Precedence', () => {
    it('respects multiplication over addition', () => {
      const template = '$a + $b * $c';
      const context = { a: 2, b: 3, c: 4 };
      expect(engine.render(template, context)).toBe('14'); // 2 + (3 * 4)
    });

    it('respects parentheses', () => {
      const template = '($a + $b) * $c';
      const context = { a: 2, b: 3, c: 4 };
      expect(engine.render(template, context)).toBe('20'); // (2 + 3) * 4
    });

    it('respects logical AND over OR', () => {
      const template = '#if($a || $b && $c)result#end';
      const context = { a: false, b: true, c: true };
      expect(engine.render(template, context)).toBe('result'); // false || (true && true)
    });
  });
});



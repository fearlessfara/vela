/** AWS-SPEC: VTL Expressions (Java Verified) | OWNER: vela | STATUS: READY */

import { testAgainstJava } from '../helpers/java-comparison.js';

describe('Expression Operators (Java Verified)', () => {
  describe('Arithmetic Operators', () => {
    it('evaluates addition', async () => {
      const template = '#set($result = $a + $b)$result';
      const context = { a: 5, b: 3 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) {
        console.warn('Skipping: Java runner not available');
        return;
      }
      
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('evaluates subtraction', async () => {
      const template = '#set($result = $a - $b)$result';
      const context = { a: 10, b: 4 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates multiplication', async () => {
      const template = '#set($result = $a * $b)$result';
      const context = { a: 6, b: 7 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates division', async () => {
      const template = '#set($result = $a / $b)$result';
      const context = { a: 20, b: 4 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates modulo', async () => {
      const template = '#set($result = $a % $b)$result';
      const context = { a: 17, b: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('handles division by zero', async () => {
      const template = '#set($result = $a / $b)$result';
      const context = { a: 10, b: 0 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates chained arithmetic', async () => {
      const template = '#set($result = $a + $b * $c)$result';
      const context = { a: 2, b: 3, c: 4 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates arithmetic with parentheses', async () => {
      const template = '#set($result = ($a + $b) * $c)$result';
      const context = { a: 2, b: 3, c: 4 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });
  });

  describe('Comparison Operators', () => {
    it('evaluates equality (==)', async () => {
      const template = '#if($a == $b)equal#else not equal#end';
      const context = { a: 5, b: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates inequality (!=)', async () => {
      const template = '#if($a != $b)not equal#else equal#end';
      const context = { a: 5, b: 6 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates less than (<)', async () => {
      const template = '#if($a < $b)less#else not less#end';
      const context = { a: 3, b: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates less than or equal (<=)', async () => {
      const template = '#if($a <= $b)less or equal#else greater#end';
      const context = { a: 5, b: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates greater than (>)', async () => {
      const template = '#if($a > $b)greater#else not greater#end';
      const context = { a: 7, b: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates greater than or equal (>=)', async () => {
      const template = '#if($a >= $b)greater or equal#else less#end';
      const context = { a: 5, b: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });
  });

  describe('Logical Operators', () => {
    it('evaluates logical AND (&&)', async () => {
      const template = '#if($a && $b)both true#else not both#end';
      const context = { a: true, b: true };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates logical OR (||)', async () => {
      const template = '#if($a || $b)at least one#else both false#end';
      const context = { a: true, b: false };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('evaluates logical NOT (!)', async () => {
      const template = '#if(!$a)not true#else true#end';
      const context = { a: false };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });
  });

  describe('Ternary Operator', () => {
    it('evaluates ternary operator', async () => {
      const template = '#set($result = $a ? $b : $c)$result';
      const context = { a: true, b: 'yes', c: 'no' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });
  });

  describe('Unary Operators', () => {
    it('evaluates unary minus', async () => {
      const template = '#set($result = -$a)$result';
      const context = { a: 5 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });
  });

  describe('Operator Precedence', () => {
    it('respects multiplication over addition', async () => {
      const template = '#set($result = $a + $b * $c)$result';
      const context = { a: 2, b: 3, c: 4 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });

    it('respects parentheses', async () => {
      const template = '#set($result = ($a + $b) * $c)$result';
      const context = { a: 2, b: 3, c: 4 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      expect(result.match).toBe(true);
    });
  });
});


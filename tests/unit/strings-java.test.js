/** AWS-SPEC: VTL String Operations (Java Verified) | OWNER: vela | STATUS: READY */

import { testAgainstJava } from '../helpers/java-comparison.js';

describe('String Operations (Java Verified)', () => {
  describe('String Concatenation', () => {
    it('concatenates strings with + operator', async () => {
      const template = '#set($result = $a + $b)$result';
      const context = { a: 'Hello', b: 'World' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('concatenates string and number', async () => {
      const template = '#set($result = $a + $b)$result';
      const context = { a: 'Number: ', b: 42 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('concatenates multiple strings', async () => {
      const template = '#set($result = $a + $b + $c)$result';
      const context = { a: 'Hello', b: ' ', c: 'World' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('concatenates with string literals', async () => {
      const template = '#set($result = "Hello" + " " + "World")$result';
      const result = await testAgainstJava(template, {});
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });
  });

  describe('String Interpolation in Double-Quoted Strings', () => {
    it('interpolates variables in double-quoted strings', async () => {
      const template = '"Hello $name"';
      const context = { name: 'World' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('does not interpolate in single-quoted strings', async () => {
      const template = '\'Hello $name\'';
      const context = { name: 'World' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('handles undefined variables in double-quoted strings', async () => {
      const template = '"Hello $name"';
      const context = {};
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('handles quiet references with undefined variables', async () => {
      const template = '"Hello $!name"';
      const context = {};
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('interpolates complex expressions in double-quoted strings', async () => {
      const template = '"Value: ${$a + $b}"';
      const context = { a: 5, b: 3 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('handles multiple interpolations in one string', async () => {
      const template = '"$first $last"';
      const context = { first: 'John', last: 'Doe' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });
  });

  describe('String Escaping', () => {
    it('handles escaped quotes in double-quoted strings', async () => {
      const template = '"He said \\"Hello\\""';
      const result = await testAgainstJava(template, {});
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('handles escaped newlines', async () => {
      const template = '"Line 1\\nLine 2"';
      const result = await testAgainstJava(template, {});
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('handles escaped tabs', async () => {
      const template = '"Col1\\tCol2"';
      const result = await testAgainstJava(template, {});
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });
  });
});


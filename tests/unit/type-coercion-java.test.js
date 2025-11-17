/** AWS-SPEC: VTL Type Coercion (Java Verified) | OWNER: vela | STATUS: READY */

import { testAgainstJava } from '../helpers/java-comparison.js';

describe('Type Coercion (Java Verified)', () => {
  describe('String to Number', () => {
    it('converts string numbers in arithmetic', async () => {
      const template = '#set($result = $a * $b)$result';
      const context = { a: '5', b: '3' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('converts string numbers in comparison', async () => {
      const template = '#if($a == $b)equal#else not equal#end';
      const context = { a: '5', b: 5 };
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

  describe('Number to String', () => {
    it('converts numbers to strings in concatenation', async () => {
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
  });

  describe('Boolean Coercion', () => {
    it('treats true as truthy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: true };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('treats false as falsy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: false };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('treats non-zero numbers as truthy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: 1 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('treats zero as falsy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: 0 };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('treats non-empty strings as truthy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: 'hello' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('treats empty strings as falsy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: '' };
      const result = await testAgainstJava(template, context);
      
      if (result.skipped) return;
      if (!result.match) {
        console.log('Java output:', JSON.stringify(result.javaOutput));
        console.log('TS output:', JSON.stringify(result.tsOutput));
        console.log('Diff:', result.diff);
      }
      expect(result.match).toBe(true);
    });

    it('treats null as falsy', async () => {
      const template = '#if($value)yes#else no#end';
      const context = { value: null };
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
});


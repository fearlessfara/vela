import { CoreVtlEngine } from '../src/core/engine';

describe('Newline semantics (Velocity parity)', () => {
  const engine = new CoreVtlEngine();

  test('foreach without extra blank lines', () => {
    const tpl = `#foreach($i in [1..3])
Item:$i
#end`;
    const out = engine.renderTemplate({ template: tpl }).output.trimEnd();
    expect(out).toBe('Item:1\nItem:2\nItem:3');
  });

  test('if/else does not add surrounding blank lines', () => {
    const tpl = `#if($cond)
yes
#else
no
#end`;
    const outTrue = engine.renderTemplate({ template: tpl, context: { cond: true } }).output.trim();
    const outFalse = engine.renderTemplate({ template: tpl, context: { cond: false } }).output.trim();
    expect(outTrue).toBe('yes');
    expect(outFalse).toBe('no');
  });
});


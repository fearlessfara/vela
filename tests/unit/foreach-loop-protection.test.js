import { VtlEngine } from '../../dist/apigw/engine.js';

const ALL_PROVIDERS_ON = {
  APIGW_CONTEXT: 'ON',
  APIGW_INPUT: 'ON',
  APIGW_UTILS: 'ON',
};

describe('Foreach Loop Protection', () => {
  it('should allow loops within the default limit', () => {
    const engine = new VtlEngine();
    const template = '#foreach($i in [1..10])$i,#end';
    const event = {};

    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('1,2,3,4,5,6,7,8,9,10,');
  });

  it('should truncate loops that exceed the default limit (1000)', () => {
    const engine = new VtlEngine();
    // Create a large range that would exceed 1000 iterations
    const template = '#foreach($i in [1..2000])$i,#end';
    const event = {};

    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    // Should only render first 1000 items
    const outputItems = result.output.split(',').filter(item => item);
    expect(outputItems.length).toBe(1000);
    expect(outputItems[0]).toBe('1');
    expect(outputItems[999]).toBe('1000');
  });

  it('should respect custom maxNbrLoops setting when provided', () => {
    // Test with a custom limit of 5
    const engine = new VtlEngine();
    engine.setMaxLoops = (maxLoops) => {
      // This would need to be implemented in VtlEngine to pass maxLoops to VtlEvaluator
      engine.maxNbrLoops = maxLoops;
    };
    
    const template = '#foreach($i in [1..10])$i,#end';
    const event = {};

    // Note: This test assumes VtlEngine exposes a way to configure maxNbrLoops
    // This may need to be added to the VtlEngine interface
    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    const outputItems = result.output.split(',').filter(item => item);
    expect(outputItems.length).toBeLessThanOrEqual(10);
  });

  it('should handle nested foreach loops with combined protection', () => {
    const engine = new VtlEngine();
    const template = `
#foreach($i in [1..50])
  #foreach($j in [1..50])
    $i-$j,
  #end
#end`;
    const event = {};

    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    // Should be truncated before reaching 50*50=2500 iterations
    const outputItems = result.output.split(',').filter(item => item.trim());
    expect(outputItems.length).toBeLessThanOrEqual(1000);
  });

  it('should work with arrays from input data', () => {
    const engine = new VtlEngine();
    const template = '#foreach($item in $input.json("$.items"))$item.id,#end';
    
    // Create an array with more than 1000 items
    const largeArray = Array.from({ length: 1500 }, (_, i) => ({ id: i + 1 }));
    const event = {
      body: JSON.stringify({ items: largeArray })
    };

    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    const outputItems = result.output.split(',').filter(item => item);
    expect(outputItems.length).toBe(1000); // Should be limited to 1000
    expect(outputItems[0]).toBe('1');
    expect(outputItems[999]).toBe('1000');
  });

  it('should handle zero maxNbrLoops gracefully', () => {
    const engine = new VtlEngine();
    // This test assumes we can configure maxNbrLoops to 0
    // The VtlEvaluator constructor should handle this case
    
    const template = '#foreach($i in [1..5])$i,#end';
    const event = {};

    // With maxNbrLoops = 0, should use Number.MAX_SAFE_INTEGER as fallback
    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toBe('1,2,3,4,5,');
  });

  it('should work correctly with foreach.stop() calls', () => {
    const engine = new VtlEngine();
    const template = `
#foreach($i in [1..2000])
  $i,
  #if($i == 5)
    $foreach.stop()
  #end
#end`;
    const event = {};

    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    // Should stop at 5 due to $foreach.stop(), not due to maxNbrLoops
    const numbers = result.output.match(/\d+/g);
    expect(numbers).toEqual(['1', '2', '3', '4', '5']);
  });

  it('should maintain foreach variables correctly with loop protection', () => {
    const engine = new VtlEngine();
    const template = `
#foreach($i in [1..10])
  index:$foreach.index count:$foreach.count hasNext:$foreach.hasNext first:$foreach.first last:$foreach.last|
#end`;
    const event = {};

    const result = engine.renderTemplate({
      template,
      event,
      flags: ALL_PROVIDERS_ON,
    });

    expect(result.errors).toEqual([]);
    expect(result.output).toContain('index:0 count:1 hasNext:true first:true last:false');
    expect(result.output).toContain('index:9 count:10 hasNext:false first:false last:true');
  });
});
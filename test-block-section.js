import { VelocityEngine } from './dist/index.js';

// Test the specific problematic section
const template = `#if (true)
    this is the if statement.

    #if (true)

        this is great

    #end

#end`;

const engine = new VelocityEngine({ spaceGobbling: 'lines' });
const output = engine.render(template, {});

console.log('Output:');
console.log(JSON.stringify(output));

console.log('\nOutput lines:');
const lines = output.split('\n');
lines.forEach((line, i) => {
  console.log(`Line ${i + 1}: ${JSON.stringify(line)} (${line.length} chars)`);
});

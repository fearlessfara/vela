import { VelocityEngine } from './dist/engine.js';

const template = `#if(true)
  #if(true)
    #if(true)
      Deep nesting works
    #end
  #end
#end`;

const engine = new VelocityEngine({
  spaceGobbling: 'lines', // Default mode
});

const result = engine.render(template, { condition: true });console.log('Result:');
console.log(JSON.stringify(result));
console.log('\nCharacter breakdown:');
for (let i = 0; i < result.length; i++) {
  const char = result[i];
  const code = result.charCodeAt(i);  const display = char === '\n' ? '\\n' : char === ' ' ? '·' : char;
  console.log(`[${i}] ${display} (${code})`);
}

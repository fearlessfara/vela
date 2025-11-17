import { VtlParser } from './dist/parser/vtlParser.js';
import { allTokens } from './dist/lexer/tokens.js';
import { Lexer } from 'chevrotain';

const template = `#if(true)
  #if(true)
    #if(true)
      Deep nesting works
    #end
  #end
#end`;

const lexer = new Lexer(allTokens);
const tokens = lexer.tokenize(template).tokens;

console.log('=== TOKENS ===');
tokens.forEach((token, i) => {
  console.log(`${i}: ${token.tokenType.name.padEnd(20)} "${token.image.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/ /g, '·')}"`);
});

const parser = new VtlParser();
parser.input = tokens;
const cst = parser.template();

console.log('\n=== CST segments ===');
function showSegments(segments, indent = 0) {
  const sp = '  '.repeat(indent);
  if (!segments || !segments.children || !segments.children.segment) return;
  segments.children.segment.forEach((seg, i) => {
    console.log(`${sp}Segment ${i}:`);
    if (seg.children.templateText) {
      const text = seg.children.templateText[0].children.TemplateText[0].image;
      console.log(`${sp}  Text: "${text.replace(/\n/g, '\\n').replace(/ /g, '·')}"`);
    } else if (seg.children.directive) {
      const dir = seg.children.directive[0];
      if (dir.children.ifDirective) {
        const ifDir = dir.children.ifDirective[0];
        console.log(`${sp}  IfDirective:`);
        showSegments(ifDir.children, indent + 2);
      }
    }
  });
}
showSegments(cst.children, 0);

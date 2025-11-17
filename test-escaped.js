import { VtlParser } from './dist/parser/vtlParser.js';
import { cstToAst } from './dist/parser/cstToAst.js';
import { createLexer } from './dist/lexer/tokens.js';

const template = `\\$price`;

console.log('Template:', template);

const lexer = createLexer();
const parser = new VtlParser();

const lexResult = lexer.tokenize(template);
console.log('\nTokens:');
lexResult.tokens.forEach((t, i) => {
  console.log(`  ${i}: ${t.tokenType.name} "${t.image}"`);
});

parser.input = lexResult.tokens;
const cst = parser.template();

const ast = cstToAst(cst);
console.log('\nAST:', JSON.stringify(ast, null, 2));

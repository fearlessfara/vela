import { VtlParser } from '../src/parser/vtlParser';
import { cstToAst } from '../src/parser/cstToAst';

function parseTemplate(source: string) {
  const parser = new VtlParser();
  const { errors, cst } = parser.parse(source);
  expect(errors).toHaveLength(0);
  return cst!;
}

describe('cstToAst', () => {
  it('maps text and interpolations into Template AST nodes', () => {
    const cst = parseTemplate('Hello $name');
    const ast = cstToAst(cst);

    expect(ast.type).toBe('Template');
    expect(ast.segments).toHaveLength(2);

    const [text, interpolation] = ast.segments as any[];
    expect(text).toEqual({
      type: 'Text',
      value: 'Hello',
      location: {
        start: expect.any(Object),
        end: expect.any(Object),
      },
    });

    expect(interpolation.type).toBe('Interpolation');
    expect(interpolation.expression).toEqual({
      type: 'VariableReference',
      name: 'name',
      quiet: false,
      location: {
        start: expect.any(Object),
        end: expect.any(Object),
      },
    });
  });

  it('creates directive nodes with branches for #if structures', () => {
    const cst = parseTemplate('#if($cond)yes#elseif($other)maybe#else nope#end');
    const ast = cstToAst(cst);

    expect(ast.segments).toHaveLength(1);
    const directive: any = ast.segments[0] as any;
    expect(directive.type).toBe('IfDirective');
    expect(directive.condition).toMatchObject({
      type: 'VariableReference',
      name: 'cond',
    });

    expect(directive.thenBody).toEqual([
      expect.objectContaining({ type: 'Text', value: 'yes' }),
    ]);

    expect(directive.elseIfBranches).toEqual([
      expect.objectContaining({
        type: 'ElseIfBranch',
        condition: expect.objectContaining({
          type: 'VariableReference',
          name: 'other',
        }),
        body: [expect.objectContaining({ type: 'Text', value: 'maybe' })],
      }),
    ]);

    expect(directive.elseBody).toEqual([
      expect.objectContaining({ type: 'Text', value: ' nope' }),
    ]);
  });

  it('preserves operator precedence in arithmetic expressions', () => {
    const cst = parseTemplate('${1+2*3}');
    const ast = cstToAst(cst);
    const expr: any = (ast.segments[0] as any).expression;

    expect(expr).toMatchObject({
      type: 'BinaryOperation',
      operator: '+',
      left: expect.objectContaining({ type: 'Literal', value: 1 }),
      right: expect.objectContaining({
        type: 'BinaryOperation',
        operator: '*',
        left: expect.objectContaining({ type: 'Literal', value: 2 }),
        right: expect.objectContaining({ type: 'Literal', value: 3 }),
      }),
    });
  });
});


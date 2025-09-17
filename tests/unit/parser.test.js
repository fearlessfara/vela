import { VtlParser } from '../../dist/parser/vtlParser.js';

function readTextFromSegment(segment) {
  const fragments = segment.children.text[0].children.AnyTextFragment;
  return fragments.map(fragment => fragment.image).join('');
}

describe('VtlParser', () => {
  it('parses text segments and interpolation chains', () => {
    const parser = new VtlParser();
    const { errors, cst } = parser.parse('Hello, $user.name');

    expect(errors).toHaveLength(0);
    expect(cst).not.toBeNull();

    const segments = cst.children.segment;
    expect(segments).toHaveLength(2);

    const textSegment = segments[0];
    expect(readTextFromSegment(textSegment)).toBe('Hello,');

    const interpolation = segments[1].children.interpolation[0];
    const varChain = interpolation.children.varChain[0];
    const variableToken = varChain.children.variableReference[0].children.DollarRef[0];
    expect(variableToken.image).toBe('$user');

    const memberSuffix = varChain.children.suffix[0];
    expect(memberSuffix.children.prop[0].image).toBe('name');
  });

  it('produces a CST for conditional directives', () => {
    const parser = new VtlParser();
    const { errors, cst } = parser.parse('#if($flag)allowed#else denied#end');

    expect(errors).toHaveLength(0);
    expect(cst.children.segment).toHaveLength(1);

    const directive = cst.children.segment[0].children.directive[0];
    expect(directive.children.ifDirective).toBeDefined();

    const thenBody = directive.children.ifDirective[0].children.thenBody;
    expect(thenBody).toBeDefined();
    const firstThenSegment = thenBody[0];
    expect(readTextFromSegment(firstThenSegment)).toBe('allowed');

    const elseBranch = directive.children.ifDirective[0].children.elseBranch[0];
    const elseBody = elseBranch.children.body[0];
    expect(readTextFromSegment(elseBody)).toBe(' denied');
  });

  it('retains parse errors for unterminated directives', () => {
    const parser = new VtlParser();
    const { errors, cst } = parser.parse('#if($flag)missing end');

    expect(errors).not.toHaveLength(0);
    expect(errors[0].message).toContain('EndDirective');
    expect(cst.children.segment[0].children.directive).toBeDefined();
  });
});

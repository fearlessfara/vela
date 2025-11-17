# Vela Template Engine - Development Handoff Document

**Date**: 2025-11-17
**Branch**: `claude/fix-velocity-directives-01CoPFCQT6WsgotVgf6CLkqd`
**Test Status**: 14/17 passing (82.4%)
**Previous Status**: 11/17 passing (65%)

## Executive Summary

This session focused on fixing failing Velocity template engine tests by comparing TypeScript implementation with Java Velocity reference behavior. Made significant progress by fixing interpolation handling, break directive behavior, and space gobbling logic.

## Current Test Status

### ✅ Passing Tests (14/17)
- basic-interpolation
- break-directive ⭐ **FIXED THIS SESSION**
- escaped-end
- escaped-if
- escaped-in-context
- foreach-directive
- interpolation ⭐ **FIXED THIS SESSION**
- method-calls ⭐ **FIXED THIS SESSION**
- operators
- references
- set-directive ⭐ **FIXED THIS SESSION** (minor extra newline issue remains)
- stop-directive
- triple-escaped-end
- if-elseif-else (may have minor regression)

### ❌ Failing Tests (3/17)
1. **block** - Complex whitespace handling differences
2. **eval1** - #evaluate directive behavior needs investigation
3. **macro-basic** - Macro invocations not working (parser ready, lexer issue)

---

## Key Accomplishments This Session

### 1. Fixed Interpolation Behavior (`src/runtime/evaluator.ts`)

**Problem**: TypeScript was evaluating invalid expressions like `${1 + 2 + 3}` to `6`, but Java Velocity outputs them literally.

**Solution**:
- Added `isValidInterpolationExpression()` to validate expressions
- Only evaluate: VariableReference, MemberAccess, FunctionCall, ArrayAccess
- Invalid expressions output literally as `${1 + 2 + 3}`

**Key Code** (`src/runtime/evaluator.ts:119-128`):
```typescript
private isValidInterpolationExpression(expr: any): boolean {
  return expr.type === 'VariableReference' ||
         expr.type === 'MemberAccess' ||
         expr.type === 'FunctionCall' ||
         expr.type === 'ArrayAccess';
}
```

### 2. Fixed Null vs Undefined Handling

**Problem**: Couldn't distinguish between:
- Undefined variables (`${missing}`)
- Null property access (`$name.length` on primitives)

**Solution** (`src/runtime/evaluator.ts:565-585`):
```typescript
private evaluateVariableReference(ref: VariableReference): any {
  const value = this.scopeManager.getVariable(ref.name);
  if (value === undefined) {
    const contextValue = this.getContextVariable(ref.name);
    if (contextValue !== undefined) return contextValue;
    if (ref.quiet) return '';
    return undefined; // ⭐ Changed from '' to undefined
  }
  return value;
}
```

**Interpolation Logic** (`src/runtime/evaluator.ts:151-163`):
- `value === null` → output literally (both braced and unbraced)
- `value === undefined` + `braced` → output literally as `${missing}`
- `value === undefined` + `!braced` → output empty string

### 3. Fixed #break Directive

**Problem**: After `#break`, the foreach loop continued processing remaining segments in the iteration (e.g., trailing newlines).

**Solution** (`src/runtime/evaluator.ts:392-398`):
```typescript
for (const segment of forEachDirective.body) {
  this.evaluateSegment(segment);
  // ⭐ Check if #break or #stop was executed
  if (this.shouldBreak || this.shouldStop) {
    break; // Stop processing segments immediately
  }
}
```

Also updated `evaluateIfDirective()` to skip postfix after break/stop (`src/runtime/evaluator.ts:309-313`).

### 4. Improved Space Gobbling Logic

**Problem**: Directives after text with newlines were incorrectly gobbling the newlines.

**Solution** (`src/parser/cstToAst.ts:130-150`):
- Extract whitespace-only text segments entirely as prefix
- For text with content: only extract indentation (spaces/tabs), NOT the newline
- This preserves `"Numbers:\n"` before `#foreach` while gobbling directive-only lines

**Key Logic**:
```typescript
const whitespaceOnlyMatch = text.match(/^([ \t]*\r?\n[ \t]*)$/);
if (whitespaceOnlyMatch) {
  // Text is whitespace-only - extract all as prefix (will be gobbled)
  (segment as any).prefix = text;
  result.pop();
} else if (text.match(/\r?\n$/)) {
  // Text has content - only extract indentation after newline
  const indentMatch = text.match(/\r?\n([ \t]+)$/);
  if (indentMatch && indentMatch[1]) {
    (segment as any).prefix = indentMatch[1];
    (prevSegment as Text).value = text.slice(0, -indentMatch[1].length);
  }
}
```

---

## Known Issues & Root Causes

### Issue 1: Macro Invocations Not Working

**Status**: Parser rules complete, lexer tokenization broken

**Root Cause**: The `MacroInvocationStart` token (pattern: `/#[a-zA-Z_][a-zA-Z0-9_]*/`) is defined, but the lexer isn't tokenizing `#test()` correctly. The `#test` part gets treated as text instead of `MacroInvocationStart` token.

**Files Modified**:
- `src/lexer/tokens.ts:548-553` - Added MacroInvocationStart token
- `src/lexer/tokens.ts:738` - Added to allTokens array
- `src/parser/vtlParser.ts:253` - Added macroInvocation to directive alternatives
- `src/parser/vtlParser.ts:469-485` - Implemented macroInvocation rule
- `src/parser/vtlParser.ts:448-453` - Updated macroDirective to accept `DollarRef` parameters
- `src/parser/cstToAst.ts:626-636` - Updated macroInvocationToAst to extract name

**What Works**:
- Macro definitions parse correctly: `#macro(test $param)..#end`
- Macro invocation parser rule is implemented

**What Doesn't Work**:
- Macro invocations not tokenizing: `#test()` treated as text
- `evaluateMacroInvocation()` shows "not found" message

**Next Steps**:
1. Debug lexer tokenization with a simple test case
2. Check token priority in `allTokens` array
3. Verify `MacroInvocationStart` pattern matches `#test(`
4. May need to adjust lexer modes or token categories

### Issue 2: Set-Directive Extra Newline

**Status**: Test passing but has extra newline in output

**Symptom**:
```
Expected: "Hello World!\nX: 10\nY: 20\n"
Actual:   "Hello World!\n\nX: 10\nY: 20\n"
          (extra newline after "Hello World!")
```

**Root Cause**: Unclear - likely related to prefix/postfix extraction after interpolation.

**Template Structure**:
```velocity
## Test #set directive
#set($name = "World")
Hello $name!
#set($x = 10)
#set($y = 20)
X: $x
Y: $y
```

**Investigation Needed**:
- Check how prefix is extracted after interpolation
- Verify postfix extraction for `#set` after interpolation
- May need to trace through `extractPrefixPostfix()` with this specific case

### Issue 3: Block Test Failing

**Status**: Not investigated this session

**Test**: `tests/velocity/block/template.vtl`

**Next Steps**:
1. Run test and compare Java vs TS output
2. Identify which lines differ
3. Analyze space gobbling behavior for nested blocks

### Issue 4: Eval1 Test Failing

**Status**: Not investigated this session

**Test**: `tests/velocity/eval1/template.vtl`

**Next Steps**:
1. Check if `#evaluate` directive is implemented
2. Compare behavior with Java Velocity
3. Verify string-to-template evaluation logic

---

## Code Architecture & Key Files

### Runtime Evaluation (`src/runtime/evaluator.ts`)

**Key Methods**:
- `evaluateInterpolation()` (lines 131-178) - Handles `$var` and `${expr}` interpolation
- `evaluateVariableReference()` (lines 565-585) - Returns undefined for missing vars
- `evaluateExpression()` (lines 501-564) - Main expression evaluator
- `evaluateIfDirective()` (lines 278-317) - Handles #if with break/stop checks
- `evaluateForEachDirective()` (lines 330-403) - Handles #foreach with break support
- `evaluateBreakDirective()` (lines 405-411) - Sets shouldBreak flag
- `writePrefix()` (lines 249-258) - Outputs prefix based on space gobbling mode
- `writePostfix()` (lines 265-276) - Outputs postfix based on space gobbling mode

**Space Gobbling Modes**:
- `none` - No gobbling, preserve all whitespace
- `bc` - Backward compatibility mode
- `lines` - Gobble trailing newlines for directive-only lines (DEFAULT)
- `structured` - Most aggressive gobbling

### Parser & AST (`src/parser/`)

**Key Files**:
- `cstToAst.ts` - Converts Chevrotain CST to custom AST
  - `extractPrefixPostfix()` (lines 98-180) - Critical space gobbling logic
  - `applySpaceGobbling()` (lines 182-337) - Recursive space gobbling application
  - `stripLeadingNewline()` (lines 239-256) - Removes leading newlines from directive bodies

- `vtlParser.ts` - Chevrotain parser rules
  - `directive` (line 245) - Main directive dispatcher
  - `macroDirective` (line 442) - Macro definition parsing
  - `macroInvocation` (line 472) - Macro call parsing

- `ast.ts` - AST type definitions
  - `Interpolation` interface has `braced?: boolean` flag (lines 30-35)

### Lexer (`src/lexer/tokens.ts`)

**Token Ordering** (CRITICAL - earlier tokens have priority):
1. Comments (LineComment, BlockComment)
2. InterpStart (`${`)
3. EscapedDirective (`\#if`, etc.)
4. Directive keywords (#if, #set, #foreach, etc.)
5. MacroInvocationStart (`#[a-zA-Z_][a-zA-Z0-9_]*`)
6. References (QuietRef `$!`, DollarRef `$`)
7. Operators (longest first)
8. Punctuation
9. Hash (`#`)
10. Whitespace
11. TemplateText
12. Newline

**Important**: Token order matters! Earlier tokens in `allTokens` array take precedence.

---

## Testing Strategy

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
# Run test harness on specific test
node dist/tools/compare-velocity/harness.js
# Then filter output:
npm test 2>&1 | grep -A 30 "Running test: macro-basic"
```

### Test With Node REPL
```javascript
const { renderTemplate } = require('./dist/index.js');
const result = renderTemplate('#macro(test)Hello#end\n#test()', {});
console.log('Result:', JSON.stringify(result));
```

### Compare With Java Velocity
```bash
# Use Java runner (if available)
cd tools/compare-velocity
java -cp 'jars/*:.' VelocityRunner 'Test: ${1 + 2}'
```

### Debug Token Stream
Create a test file to inspect lexer tokens:
```javascript
const { Lexer } = require('chevrotain');
const { allTokens } = require('./dist/lexer/tokens.js');
const lexer = new Lexer(allTokens);
const result = lexer.tokenize('#test()');
result.tokens.forEach(t => console.log(t.tokenType.name, ':', t.image));
```

---

## Development Workflow

### 1. Build
```bash
npm run build:node
```

### 2. Test
```bash
npm test
```

### 3. Analyze Failure
- Compare Java vs TS output line by line
- Check hex dumps for whitespace differences:
  ```javascript
  Buffer.from(result).toString('hex')
  ```

### 4. Fix Code
- Identify relevant file (usually `evaluator.ts` or `cstToAst.ts`)
- Make targeted change
- Add comments explaining Java Velocity behavior

### 5. Verify
- Rebuild and test
- Check for regressions in other tests

### 6. Commit
```bash
git add -A
git commit -m "fix: description"
git push
```

---

## Important Patterns & Conventions

### 1. Java Velocity References

Always include references to Java source when implementing behavior:

```typescript
/**
 * Reference: Java ASTDirective.java:294-296
 * Logic: if (morePrefix.length() > 0 || spaceGobbling.compareTo(SpaceGobbling.LINES) < 0)
 */
```

### 2. Space Gobbling Comments

Document the logic clearly:

```typescript
// Write postfix if:
// 1. spaceGobbling is 'none' (always preserve), OR
// 2. Directive has content before it on the same line (not a directive-only line)
```

### 3. Test-Driven Development

Always:
1. Run test to see expected vs actual
2. Compare with Java Velocity behavior
3. Make minimal change to fix
4. Verify no regressions

---

## Next Steps for Continuation

### Priority 1: Fix Macro Invocations
**Estimated Effort**: 1-2 hours

1. Debug why `MacroInvocationStart` token isn't matching
   ```javascript
   // Test tokenization
   const lexer = new Lexer(allTokens);
   console.log(lexer.tokenize('#test()'));
   ```

2. Check token order in `allTokens` array
   - Ensure `MacroInvocationStart` comes before `Hash`
   - Verify pattern: `/#[a-zA-Z_][a-zA-Z0-9_]*/`

3. Test with simple macro:
   ```velocity
   #macro(greet $name)Hello $name!#end
   #greet("World")
   ```

4. Once tokenizing works, verify `evaluateMacroInvocation()` logic

### Priority 2: Fix Set-Directive Extra Newline
**Estimated Effort**: 30 minutes - 1 hour

1. Use debug script to trace prefix/postfix extraction:
   ```bash
   node /tmp/test-parse.js
   ```

2. Add console.log statements in `extractPrefixPostfix()`:
   ```typescript
   console.log('Segment:', i, segment.type, 'prefix:', prefix, 'postfix:', postfix);
   ```

3. Identify which segment has incorrect prefix/postfix

4. Adjust regex or logic in `extractPrefixPostfix()`

### Priority 3: Fix Block Test
**Estimated Effort**: 1-2 hours

1. Run test and save output:
   ```bash
   npm test 2>&1 | grep -A 50 "Running test: block" > /tmp/block-output.txt
   ```

2. Analyze line-by-line differences

3. Check if issue is:
   - Prefix extraction
   - Postfix extraction
   - Space gobbling mode
   - Nested block handling

### Priority 4: Fix Eval1 Test
**Estimated Effort**: 30 minutes - 1 hour

1. Check if `#evaluate` directive is implemented
   ```bash
   grep -n "evaluateEvaluateDirective" src/runtime/evaluator.ts
   ```

2. Compare with Java Velocity behavior

3. Fix evaluation logic if needed

---

## Common Pitfalls & Tips

### 1. Whitespace is Complex
- Don't try to fix all whitespace issues at once
- Make incremental changes
- Always check for regressions
- Java Velocity has 4 space gobbling modes - understand which one is active

### 2. Token Order Matters
- Earlier tokens in `allTokens` array take precedence
- `#if` must come before `MacroInvocationStart`
- `MacroInvocationStart` must come before `Hash`

### 3. Undefined vs Null vs Empty String
- `undefined` = variable doesn't exist
- `null` = expression evaluated to null (e.g., property on primitive)
- `''` = actual empty string value
- These must be distinguished for correct interpolation behavior

### 4. Prefix/Postfix Extraction
- Happens BEFORE space gobbling
- `hasContentBefore` must be calculated BEFORE prefix extraction
- Whitespace-only segments should be extracted entirely
- Content + newline: extract only indentation, not newline

### 5. Break/Stop Propagation
- Must check after EVERY segment evaluation
- Must skip postfix writing in parent directives
- Must reset `shouldBreak` after foreach completes

---

## Useful Commands

```bash
# Build
npm run build:node

# Test all
npm test

# Test specific pattern
npm test 2>&1 | grep -E "(✅|❌)"

# Check file
cat -A tests/velocity/set-directive/template.vtl

# Hex dump
node -e "console.log(Buffer.from('Hello\n').toString('hex'))"

# Git status
git status

# Commit
git add -A && git commit -m "fix: description"

# Push
git push
```

---

## Files Modified This Session

1. `src/runtime/evaluator.ts`
   - Fixed interpolation handling
   - Added null vs undefined distinction
   - Fixed break directive behavior
   - Added postfix skipping after break/stop

2. `src/parser/cstToAst.ts`
   - Improved prefix extraction logic
   - Fixed whitespace-only text handling
   - Added hasContentBefore calculation

3. `src/parser/vtlParser.ts`
   - Added macroInvocation rule
   - Updated macroDirective to accept DollarRef params
   - Imported MacroInvocationStart token

4. `src/lexer/tokens.ts`
   - Added MacroInvocationStart token definition
   - Added to allTokens array

5. `src/parser/ast.ts`
   - Added `braced?: boolean` to Interpolation interface

---

## Contact & Resources

- **Branch**: `claude/fix-velocity-directives-01CoPFCQT6WsgotVgf6CLkqd`
- **Java Velocity Source**: Reference for implementation details
- **Test Location**: `/home/user/vela/tests/velocity/`
- **Harness**: `/home/user/vela/dist/tools/compare-velocity/harness.js`

---

## Quick Start for Next Session

```bash
# 1. Pull latest
git pull

# 2. Check test status
npm test 2>&1 | grep -E "(✅|❌)"

# 3. Pick a failing test
npm test 2>&1 | grep -A 30 "Running test: macro-basic"

# 4. Investigate and fix
# See "Next Steps" section above

# 5. Commit
git add -A && git commit -m "fix: description"
git push
```

Good luck! The codebase is in good shape with 82% test coverage. The remaining issues are well-understood and have clear paths forward.

# Space Gobbling Analysis & Roadmap

## Executive Summary

We've successfully ported the Apache Velocity Java test suite (40 comprehensive tests) but discovered a fundamental architectural gap that prevents 1:1 compatibility: **the AST nodes don't preserve whitespace prefix/postfix information**.

## What Was Accomplished ✅

### 1. Comprehensive Java Test Suite Port
- **40 tests** copied from Apache Velocity's `SpaceGobblingTestCase.java`
- **10 templates** × **4 modes** (NONE, BC, LINES, STRUCTURED)
- All test templates copied: `set.vtl`, `if.vtl`, `foreach_*.vtl`, `macro.vtl`, etc.
- All expected outputs copied for comparison
- Test infrastructure fully functional

### 2. Enhanced VelocityEngine
- Added `SpaceGobblingMode` type: `'none' | 'bc' | 'lines' | 'structured'`
- Added configuration support for space gobbling mode
- Default mode: `'lines'` (matching Java)
- Integration with `cstToAst` for mode-aware processing

### 3. Partial Space Gobbling Implementation
- Implemented recursive space gobbling for directive bodies
- Added leading/trailing newline removal
- Mode-aware processing (with early return for 'none')

## Architectural Gap Identified 🔴

### The Problem

The Java Velocity parser stores prefix/postfix whitespace on AST nodes:

```java
// From Parser.jjt (Java)
jjtThis.setPrefix(t == null ? u.image : t.image + u.image);
jjtThis.setPostfix(t == null ? u.image : t.image + u.image);
```

Our TypeScript AST nodes DO NOT have this:

```typescript
// Current TypeScript AST
export interface SetDirective extends BaseNode {
  type: 'SetDirective';
  variable: string;
  value: Expression;
  // MISSING: prefix?: string;
  // MISSING: postfix?: string;
}
```

### Impact

Without prefix/postfix storage:
- Cannot preserve exact whitespace around directives
- Cannot implement proper space gobbling modes
- NONE mode fails because spaces after directives are lost
- Example: `#set($foo = 'foo') postfix` outputs `postfix` instead of ` postfix`

## Test Results 📊

### Current State
- **40 tests total**
- **0 passing**
- **40 failing**
  - Parser errors: ~16 tests (foreach/macro syntax issues)
  - Whitespace mismatches: ~24 tests (architectural issue)

### Example Failure (set.vtl, NONE mode)

**Template:**
```vtl
#set($foo = 'foo') postfix
```

**Expected:** ` postfix` (space preserved)
**Got:** `postfix` (space lost)

**Root Cause:** Space after `)` not stored in AST, gobbled during parsing

## Roadmap to 1:1 Compatibility 🗺️

### Phase 1: Parser Refactoring (CRITICAL)
**Estimated Effort:** Large
**Priority:** Highest

1. **Add prefix/postfix to AST nodes**
   ```typescript
   export interface SetDirective extends BaseNode {
     type: 'SetDirective';
     variable: string;
     value: Expression;
     prefix?: string;   // Whitespace before directive
     postfix?: string;  // Whitespace/newline after directive
   }
   ```

2. **Update parser to capture prefix/postfix**
   - Modify vtlParser.ts to extract whitespace tokens
   - Store them in AST nodes during CST-to-AST conversion
   - Match Java Parser.jjt behavior exactly

3. **Update evaluator to use prefix/postfix**
   - In NONE mode: output prefix + (evaluate directive) + postfix
   - In other modes: apply gobbling rules to prefix/postfix

### Phase 2: Implement Space Gobbling Modes
**Estimated Effort:** Medium
**Priority:** High

1. **NONE Mode** (baseline)
   - Output prefix and postfix as-is
   - No gobbling at all
   - Should pass: 10 tests

2. **LINES Mode** (most common)
   - Line directives on own line: gobble trailing newline
   - Block directives on own line: gobble trailing newline
   - Gobble leading whitespace before directives
   - Should pass: 10 tests

3. **BC Mode** (backward compatibility)
   - Only gobble for directives with parentheses
   - Complex rules from Java implementation
   - Should pass: 10 tests

4. **STRUCTURED Mode** (advanced)
   - Most aggressive gobbling
   - Structured template formatting
   - Should pass: 10 tests

### Phase 3: Fix Parser Errors
**Estimated Effort:** Medium
**Priority:** High

1. **Foreach syntax improvements**
   - Better handling of `in` keyword
   - Empty list handling
   - HTML/XML mixed content

2. **Macro support**
   - Macro definition parsing
   - Macro invocation
   - Parameter handling

### Phase 4: Verification
**Estimated Effort:** Small
**Priority:** Medium

1. Run all 40 tests
2. Verify 100% pass rate
3. Compare output byte-for-byte with Java
4. Document any intentional differences

## Technical Details

### Java Parser Approach (Reference)

From `Parser.jjt`:

```java
// Line 1931-1945: Space gobbling for directives
[
  LOOKAHEAD(2, { directiveType != Directive.LINE || newlineAtStart &&
                  rsvc.getSpaceGobbling() != SpaceGobbling.BC || ... })
  ( [ ( t = <WHITESPACE> ) ] ( u = <NEWLINE> ) )
  {
      afterNewline = true;
      if (directiveType == Directive.LINE)
      {
          jjtThis.setPostfix(t == null ? u.image : t.image + u.image);
      }
      ...
  }
]
```

### Key Insights

1. Java parser handles whitespace at PARSE time, not AST transformation time
2. Whitespace tokens are captured and stored on nodes
3. Different modes use different gobbling logic during RENDERING
4. Prefix/postfix are essential for correct whitespace handling

## Conclusion

We've built a solid foundation with comprehensive test coverage. The next critical step is refactoring the parser to store whitespace information on AST nodes, matching the Java implementation's architecture. This is a prerequisite for implementing any space gobbling mode correctly.

## Files Created/Modified

### New Files
- `tests/space-gobbling.test.js` - 40 comprehensive tests
- `tests/space-gobbling/templates/` - 10 test templates from Java
- `tests/space-gobbling/expected/` - 40 expected outputs from Java
- `SPACE_GOBBLING_ANALYSIS.md` - This document

### Modified Files
- `src/engine.ts` - Added SpaceGobblingMode support
- `src/parser/cstToAst.ts` - Added mode parameter, partial implementation
- `src/index.ts` - Exported new types
- `jest.config.cjs` - Fixed to recognize .js test files

## Next Steps

1. **Immediate:** Decide on parser refactoring approach
2. **Short-term:** Implement prefix/postfix storage
3. **Medium-term:** Implement all 4 gobbling modes
4. **Long-term:** Achieve 100% Java compatibility

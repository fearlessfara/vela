# Velocity Integration Tests

## Overview

This directory contains **101 integration tests** that validate Vela's TypeScript implementation against the official Apache Velocity Java implementation. Each test compares Vela's output line-by-line with Java Velocity 2.3 to ensure 1:1 compatibility.

## Test Structure

Tests are **dead simple** and **auto-discovered**. No expected output files needed!

```
tests/velocity/
├── test-name/
│   ├── template.vtl    # The Velocity template to test
│   └── input.json      # Context variables (can be empty {})
```

That's it! The test harness automatically:
1. Discovers tests by scanning for directories with `template.vtl` and `input.json`
2. Runs the template through Java Velocity (source of truth)
3. Runs the template through TypeScript Vela
4. Compares outputs line-by-line and reports differences

## Running Tests

```bash
# Run all tests
npm test

# Run a single test
npm run test:velocity:single <test-name>

# Examples
npm run test:velocity:single operators/comparison-eq
npm run test:velocity:single directives/foreach-array
```

## Adding New Tests

### Method 1: Use the Scaffolding Tool (Recommended)

```bash
# Create from preset
npm run add-test directives/my-test --preset directive-foreach

# Create custom test
npm run add-test operators/my-op --template "#set($x = 5)$x" --context '{}'

# Create minimal test (then edit files)
npm run add-test edge-cases/my-edge
```

### Method 2: Manual Creation

```bash
# 1. Create test directory
mkdir -p tests/velocity/my-category/my-test

# 2. Create template file
echo '#set($x = 5)$x' > tests/velocity/my-category/my-test/template.vtl

# 3. Create input file
echo '{}' > tests/velocity/my-category/my-test/input.json

# 4. Run the test
npm run test:velocity:single my-category/my-test
```

## Test Organization

Tests are organized by feature category for clarity:

### Directives (20 tests)
- `directives/if-*` - Conditional directives (#if, #elseif, #else)
- `directives/foreach-*` - Loop directives (#foreach, #break)
- `directives/set-*` - Variable assignment (#set)
- `directives/macro-*` - Macro definition and invocation
- `directives/comments-*` - Line (##) and block (#* *#) comments

### Operators (29 tests)
- `operators/comparison-*` - Comparison operators (==, !=, >, >=, <, <=, eq, ne, gt, ge, lt, le)
- `operators/logical-*` - Logical operators (&&, ||, !, and, or, not)
- `operators/arithmetic-*` - Math operators (+, -, *, /, %)
- `operators/precedence-*` - Operator precedence and parentheses
- `operators/range-*` - Range operator [1..5]
- `operators/complex-*` - Complex nested expressions

### References (13 tests)
- `references/quiet-*` - Quiet references ($!variable)
- `references/formal-*` - Formal notation (${variable})
- `references/property-*` - Property access ($obj.property)
- `references/array-*` - Array/list indexing ($arr[0])
- `references/map-*` - Map access ($map["key"])
- `references/chained-*` - Chained property access
- `references/mixed-*` - Mixed array and property access

### Strings (9 tests)
- `strings/single-quoted` - Single-quoted strings (no interpolation)
- `strings/double-quoted` - Double-quoted strings (with interpolation)
- `strings/interpolation` - String interpolation
- `strings/escaped-*` - Escaped quotes and references
- `strings/concat-*` - String concatenation
- `strings/multiline-*` - Multi-line strings

### Edge Cases (15 tests)
- `edge-cases/null-*` - Null value handling
- `edge-cases/undefined-*` - Undefined variable handling
- `edge-cases/empty-*` - Empty strings and collections
- `edge-cases/zero-*` - Zero value handling
- `edge-cases/boolean-*` - Boolean true/false handling
- `edge-cases/nested-*` - Deeply nested structures
- `edge-cases/whitespace-*` - Whitespace preservation
- `edge-cases/multiline-*` - Multi-line directives
- `edge-cases/special-*` - Special characters

### Original Tests (17 tests)
Legacy tests from initial development:
- `basic-interpolation`, `interpolation`
- `block` - Block directive testing
- `break-directive`, `stop-directive`
- `escaped-*` - Escaped directive tests
- `eval1` - Eval directive
- `foreach-directive`, `if-elseif-else`
- `macro-basic`, `method-calls`
- `operators`, `references`
- `set-directive`

## Test Coverage Summary

| Feature Category | Tests | Coverage |
|-----------------|-------|----------|
| Directives | 20 | ✅ All major directives |
| Operators | 29 | ✅ All operators (symbol & word forms) |
| References | 13 | ✅ All reference notations |
| Strings | 9 | ✅ All string types & escaping |
| Edge Cases | 15 | ✅ Common edge cases |
| Original | 17 | ✅ Legacy comprehensive tests |
| **Total** | **103** | **Comprehensive coverage** |

## Writing Good Tests

### ✅ DO

- **Keep tests simple and focused** - Test one feature at a time
- **Use descriptive names** - `comparison-eq` not `test1`
- **Provide minimal context** - Only include necessary variables
- **Test edge cases** - Null, empty, undefined, special chars
- **Test both symbol and word forms** - `&&` and `and`, `==` and `eq`

### ❌ DON'T

- **Don't create complex multi-feature tests** - Hard to debug when they fail
- **Don't use vague names** - `test`, `example`, `foo`
- **Don't include unnecessary context** - Keep input.json minimal
- **Don't duplicate tests** - Check if similar test exists first

## Examples

### Simple Directive Test
```vtl
<!-- template.vtl -->
#if($condition)
Condition is true
#else
Condition is false
#end
```

```json
// input.json
{
  "condition": true
}
```

### Operator Test
```vtl
<!-- template.vtl -->
#set($a = 5)
#set($b = 3)
#if($a > $b)
a is greater than b
#end
```

```json
// input.json
{}
```

### Reference Test
```vtl
<!-- template.vtl -->
Regular: $undefined
Quiet: $!undefined
Done
```

```json
// input.json
{}
```

### Edge Case Test
```vtl
<!-- template.vtl -->
#foreach($item in $items)
Item: $item
#end
After loop
```

```json
// input.json
{
  "items": []
}
```

## Test Harness Details

### How Tests Are Discovered

The test loader (`tools/compare-velocity/test-loader.ts`) scans `tests/velocity/` for directories containing both:
1. `template.vtl` - The Velocity template
2. `input.json` - The context variables (can be `{}`)

### How Tests Are Run

1. **Java Velocity** (`tools/compare-velocity/java-runner.ts`)
   - Loads `velocity-engine-core-2.3.jar`
   - Executes template with context
   - Returns output as "source of truth"

2. **TypeScript Vela** (`tools/compare-velocity/ts-runner.ts`)
   - Loads Vela's TypeScript implementation
   - Executes template with context
   - Returns output for comparison

3. **Comparison** (`tools/compare-velocity/comparator.ts`)
   - Compares outputs line-by-line
   - Reports differences with diff format
   - Test passes only if outputs match exactly

### Space Gobbling Mode

Currently all tests use `space.gobbling = structured` mode (default). To test other modes, you would need to modify the test harness to support per-test configuration.

## Troubleshooting

### Test Fails: "Java runner not available"

The test harness gracefully handles missing Java runner. If Java Velocity isn't available, tests will run TS-only and skip comparison. To enable full comparison:

1. Ensure Java is installed
2. Check that `velocity-engine-core-2.3.jar` is in the expected location

### Test Fails: Output Mismatch

When a test fails with output mismatch:

1. **Check the diff** - The harness shows line-by-line differences
2. **Run Java Velocity manually** - Verify expected output
3. **Debug Vela** - Check lexer/parser/evaluator for the feature
4. **Simplify the test** - Reduce to minimal reproduction case

### Test Not Discovered

If your test isn't found:

1. Verify directory structure: `tests/velocity/your-test/`
2. Ensure both files exist: `template.vtl` and `input.json`
3. Check file names are exact (case-sensitive)
4. Re-run `npm test` (tests are auto-discovered)

## Contributing Tests

When contributing new tests:

1. **Check for duplicates** - Search existing tests first
2. **Follow naming conventions** - Use `category/feature-variant` format
3. **Keep it minimal** - Focused, simple tests are better
4. **Verify against Java** - Ensure test passes with Java Velocity
5. **Document complex cases** - Add comments if test is non-obvious

## Future Test Ideas

Areas that could use more coverage:

- **#parse directive** - Include and parse external templates
- **#include directive** - Include raw file content
- **#define directive** - Define reusable content blocks
- **#macro recursion** - Recursive macro calls
- **#foreach $velocityHasNext** - Loop variable
- **Whitespace modes** - Test `bc`, `none`, `lines` modes
- **Unicode/encoding** - International characters
- **Method overloading** - Java method resolution
- **Complex objects** - Nested maps, lists, custom objects

## Quick Reference

```bash
# Test commands
npm test                              # Run all tests
npm run test:velocity:single <name>   # Run one test
npm run add-test <name>               # Create new test

# Test structure
tests/velocity/<name>/
  ├── template.vtl    # Velocity template
  └── input.json      # Context variables

# Test categories
directives/         # #if, #foreach, #set, #macro, comments
operators/          # ==, &&, +, -, *, [1..5]
references/         # $var, $!var, ${var}, $obj.prop, $arr[0]
strings/            # "text", 'text', escaping, interpolation
edge-cases/         # null, undefined, empty, nesting, special chars
```

## Resources

- [Apache Velocity User Guide](https://velocity.apache.org/engine/2.3/user-guide.html)
- [Apache Velocity VTL Reference](https://velocity.apache.org/engine/2.3/vtl-reference.html)
- [Vela Coverage Matrix](../../VELOCITY_TEST_COVERAGE.md)
- [Test Scaffolding Tool](../../tools/add-test.ts)

# Velocity Test Coverage Matrix

## Current Coverage: 17/100+ tests (17%)

### ✅ Currently Tested Features

| Feature | Test Name | Notes |
|---------|-----------|-------|
| Basic interpolation | `basic-interpolation` | Simple variable substitution |
| Block directives | `block` | Block structures |
| Break directive | `break-directive` | Loop break |
| Escaped directives | `escaped-end`, `escaped-if`, `escaped-in-context`, `triple-escaped-end` | Literal directive output |
| Eval directive | `eval1` | Dynamic template evaluation |
| Foreach directive | `foreach-directive` | Basic iteration |
| If/Elseif/Else | `if-elseif-else` | Conditional logic |
| Interpolation | `interpolation` | Variable interpolation |
| Macro basic | `macro-basic` | Basic macro definition and invocation |
| Method calls | `method-calls` | Object method invocation |
| Operators | `operators` | Basic operators |
| References | `references` | Variable references |
| Set directive | `set-directive` | Variable assignment |
| Stop directive | `stop-directive` | Template termination |

### ❌ Missing Coverage (High Priority)

#### Directives (15 tests needed)
- [ ] `#parse` - Include and parse external template
- [ ] `#include` - Include raw file content
- [ ] `#define` - Define reusable content blocks
- [ ] `#foreach` with `$velocityCount` variable
- [ ] `#foreach` with `$velocityHasNext` variable
- [ ] `#foreach` with empty collections
- [ ] `#foreach` with arrays
- [ ] `#foreach` with maps
- [ ] `#foreach` with method return values
- [ ] `#foreach` variable scoping
- [ ] `#macro` with parameters
- [ ] `#macro` with body directives
- [ ] `#macro` recursion
- [ ] `#macro` forward definition
- [ ] Comments: single-line `##` and block `#* *#`

#### Operators (20 tests needed)
- [ ] Range operator: `[1..5]`
- [ ] Comparison: `==`, `!=`
- [ ] Comparison: `>`, `>=`, `<`, `<=`
- [ ] Comparison: `eq`, `ne`
- [ ] Comparison: `gt`, `ge`, `lt`, `le`
- [ ] Logical: `&&`, `||`, `!`
- [ ] Logical: `and`, `or`, `not`
- [ ] Arithmetic: `+`, `-`, `*`, `/`, `%`
- [ ] Arithmetic with floats
- [ ] Arithmetic with mixed types
- [ ] Operator precedence: `2 + 3 * 4`
- [ ] Operator precedence: `(2 + 3) * 4`
- [ ] String concatenation
- [ ] Equality with null
- [ ] Equality with different types
- [ ] Division by zero handling
- [ ] Modulo with negative numbers
- [ ] Logical short-circuiting
- [ ] Complex expressions: `($a && $b) || ($c && $d)`
- [ ] Ternary-like patterns (if applicable)

#### Reference Notation (15 tests needed)
- [ ] Quiet reference: `$!variable`
- [ ] Quiet reference with undefined variable
- [ ] Formal notation: `${variable}`
- [ ] Formal notation: `${obj.property}`
- [ ] Formal notation: `${obj.method()}`
- [ ] Property access: `$obj.property`
- [ ] Property access: `$obj.nested.property`
- [ ] Method calls: `$obj.method()`
- [ ] Method calls with arguments: `$obj.method($arg1, $arg2)`
- [ ] Array access: `$array[0]`
- [ ] Array access: `$array[$index]`
- [ ] Map access: `$map["key"]`
- [ ] Map access: `$map[$variable]`
- [ ] Chained access: `$obj.method()[0].property`
- [ ] Index with expressions: `$array[1 + 2]`

#### Whitespace Modes (12 tests needed)
- [ ] `space.gobbling = none` - No gobbling
- [ ] `space.gobbling = bc` - Backward compatible (2+ newlines)
- [ ] `space.gobbling = lines` - Line-based gobbling
- [ ] `space.gobbling = structured` (already tested in `block`)
- [ ] Gobbling with `#if` directive
- [ ] Gobbling with `#foreach` directive
- [ ] Gobbling with `#macro` directive
- [ ] Gobbling with `#set` directive
- [ ] Gobbling with mixed directives
- [ ] Gobbling with comments
- [ ] Gobbling with empty lines
- [ ] Gobbling edge cases from Apache tests

#### Edge Cases (20 tests needed)
- [ ] Null variable handling
- [ ] Undefined variable handling
- [ ] Empty string handling
- [ ] Zero value handling
- [ ] Boolean true/false
- [ ] Empty array in `#foreach`
- [ ] Empty map in `#foreach`
- [ ] Null list in `#foreach`
- [ ] Type coercion: number to string
- [ ] Type coercion: string to number
- [ ] Type coercion: boolean contexts
- [ ] Nested macro calls
- [ ] Macro name conflicts
- [ ] Deeply nested if statements
- [ ] Deeply nested foreach loops
- [ ] Unicode characters in templates
- [ ] Special characters in strings
- [ ] Escaped characters in strings
- [ ] Multi-line directives
- [ ] Directive-only lines (space gobbling context)

#### String & Escaping (8 tests needed)
- [ ] Single-quoted strings
- [ ] Double-quoted strings
- [ ] String with escaped quotes
- [ ] String with interpolation `"Hello $name"`
- [ ] String with no interpolation (single quotes)
- [ ] Escaped references: `\$variable`
- [ ] Escaped directives: `\#if`
- [ ] Multiple escape levels: `\\$variable`

#### Advanced Features (10 tests needed)
- [ ] Velocimacro library loading
- [ ] Template encoding (UTF-8, etc.)
- [ ] Method overloading resolution
- [ ] Introspection: `$obj.getClass()`
- [ ] Context modification within template
- [ ] Formal reference with braces: `${foo}bar`
- [ ] Shorthand map notation (if supported)
- [ ] Array literals (if supported)
- [ ] Map literals (if supported)
- [ ] Complex nested structures

## Test Organization Plan

```
tests/velocity/
├── directives/
│   ├── parse/
│   ├── include/
│   ├── define/
│   ├── foreach-velocityCount/
│   ├── foreach-velocityHasNext/
│   ├── foreach-empty/
│   ├── foreach-array/
│   ├── foreach-map/
│   ├── macro-params/
│   ├── macro-recursion/
│   └── comments/
├── operators/
│   ├── range/
│   ├── comparison-symbols/
│   ├── comparison-words/
│   ├── logical-symbols/
│   ├── logical-words/
│   ├── arithmetic-basic/
│   ├── arithmetic-float/
│   ├── precedence-basic/
│   ├── precedence-parens/
│   └── string-concat/
├── references/
│   ├── quiet-basic/
│   ├── quiet-undefined/
│   ├── formal-basic/
│   ├── formal-property/
│   ├── formal-method/
│   ├── property-access/
│   ├── array-access/
│   ├── map-access/
│   └── chained-access/
├── whitespace/
│   ├── gobble-none/
│   ├── gobble-bc/
│   ├── gobble-lines/
│   ├── gobble-structured/
│   └── gobble-mixed/
├── strings/
│   ├── single-quoted/
│   ├── double-quoted/
│   ├── escaped-quotes/
│   ├── interpolation/
│   └── escaped-references/
└── edge-cases/
    ├── null-handling/
    ├── undefined-vars/
    ├── empty-collections/
    ├── type-coercion/
    ├── nested-structures/
    └── unicode/
```

## Apache Velocity Reference Tests Found

From `/tmp/velocity-engine/velocity-engine-core/src/test/resources/`:

### Templates Directory (60 tests)
- arithmetic.vm, array.vm, block.vm
- comment.vm, comparison operators
- escape.vm, escape2.vm
- foreach-*.vm (array, map, method, null-list, type, variable)
- formal.vm, if.vm, ifstatement.vm
- include.vm, interpolation.vm
- logical.vm, logical2.vm
- map.vm, math.vm
- range.vm, reference.vm
- stop*.vm, string.vm
- velocimacro.vm, velocimacro2.vm

### Gobbling Directory (11 tests)
- if.vtl, foreach_*.vtl, macro.vtl, set.vtl, structured.vtl

### Other Specialized Tests
- bc_mode/ - Backward compatible space gobbling
- evaluate/ - #evaluate directive tests
- parsemacros/ - Macro parsing tests
- set/ - #set directive edge cases
- issues/ - Bug fix regression tests

## Success Metrics

- **Target**: 100+ integration tests
- **Coverage**: All core Velocity directives, operators, and reference types
- **Pass Rate**: 95%+ (95+ tests passing)
- **Organization**: Logical grouping by feature area
- **Documentation**: Clear README explaining test structure
- **Maintainability**: Simple folder-based structure for easy test addition

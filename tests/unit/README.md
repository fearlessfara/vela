# Unit Tests

## Test Files

### Java-Verified Tests (Recommended)
These tests run the Java Velocity engine first to get the expected output, then compare with our TS implementation:

- `expressions-java.test.js` - Expression operators (arithmetic, logical, comparison, ternary)
- `strings-java.test.js` - String operations (concatenation, interpolation, escaping)
- `type-coercion-java.test.js` - Type coercion and truthiness rules

**These are the authoritative tests** - they ensure 1:1 compatibility with Java Velocity.

### Legacy Tests (May Contain Assumptions)
These tests were written with assumed correct behavior and may not match Java exactly:

- `expressions.test.js` - Expression operators (use `-java.test.js` version instead)
- `strings.test.js` - String operations (use `-java.test.js` version instead)
- `type-coercion.test.js` - Type coercion (use `-java.test.js` version instead)
- `errors.test.js` - Error handling (still useful for testing error cases)

### Core Tests
- `engine.test.js` - Basic engine functionality
- `parser.test.js` - Parser functionality
- `cst-to-ast.test.js` - AST conversion
- `debug-mode.test.js` - Debug mode functionality

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run only Java-verified tests
npm run test:unit -- --testMatch="**/*-java.test.js"

# Run specific test file
npm run test:unit -- expressions-java.test.js
```

## Test Helper

The `tests/helpers/java-comparison.js` helper function `testAgainstJava()`:
1. Runs the Java Velocity engine to get expected output
2. Runs our TS implementation
3. Compares outputs and returns detailed diff if they don't match
4. Skips gracefully if Java isn't available



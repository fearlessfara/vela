# Velocits

A TypeScript implementation of the Apache Velocity Template Language (VTL) with 1:1 Java compatibility. Built for both Node.js and browser environments using modern TypeScript best practices.

## Features

- **Full VTL Support**: Directives (`#set`, `#if`, `#foreach`, `#break`, `#stop`), expressions, and variable references
- **Java-Compatible**: 1:1 compatibility with Apache Velocity, tested against the Java reference implementation
- **Universal**: Works in Node.js and browsers (UMD, ESM)
- **Type-Safe**: Written in TypeScript with strict type checking
- **Zero Dependencies**: Only runtime dependency is Chevrotain for parsing

## Installation

```bash
npm install @fearlessfara/velocits
```

## Usage

### Node.js / ESM

```typescript
import { VelocityEngine } from '@fearlessfara/velocits';

const engine = new VelocityEngine();
const output = engine.render('Hello, $name!', { name: 'World' });
console.log(output); // "Hello, World!"
```

### Browser (UMD)

```html
<script src="https://unpkg.com/@fearlessfara/velocits"></script>
<script>
  const engine = new Velocits.VelocityEngine();
  const output = engine.render('Hello, $name!', { name: 'World' });
  console.log(output); // "Hello, World!"
</script>
```

### Advanced Example

```typescript
import { VelocityEngine } from '@fearlessfara/velocits';

const engine = new VelocityEngine();
const template = `
#set($items = ["apple", "banana", "cherry"])
#foreach($item in $items)
  - $item
#end
`;

const output = engine.render(template, {});
console.log(output);
// Output:
//   - apple
//   - banana
//   - cherry
```

## Supported Features

- **Variables**: `$variable`, `$!silent`, `${formal}`
- **Directives**:
  - `#set($var = value)` - Variable assignment
  - `#if/#elseif/#else/#end` - Conditional logic
  - `#foreach($item in $list)/#end` - Iteration
  - `#break` - Break from loops
  - `#stop` - Stop template rendering
- **Expressions**: Literals, member access, method calls, arrays, maps, operators
- **Type Coercion**: Follows Apache Velocity semantics for truthiness and type conversion
- **Scoping**: Proper variable scoping with foreach loop variables

## Development

```bash
# Install dependencies
npm install

# Initialize git submodule for Apache Velocity reference
git submodule update --init

# Build the library
npm run build

# Run comparison tests against Java implementation
npm test

# Development mode (watch)
npm run dev
```

## Testing

This library uses a comprehensive test harness that compares TypeScript output against the Apache Velocity Java reference implementation to ensure 100% compatibility.

```bash
# Run all comparison tests
npm test

# Run a specific test
npm run test:velocity:single <test-name>
```

Test cases are located in `tests/velocity/<test-name>/`:
- `template.vtl` - Velocity template
- `input.json` - Context variables

## Project Structure

```
src/
  engine.ts          - Main VelocityEngine class
  parser/            - Chevrotain parser and AST
  runtime/           - Evaluator, scope, string builder
  lexer/             - Token definitions
tools/
  compare-velocity/  - Test harness for Java/TS comparison
tests/
  velocity/          - Test cases (template.vtl + input.json)
vendor/
  velocity-engine/   - Apache Velocity Java reference (git submodule)
```

## TypeScript Configuration

This library is built with strict TypeScript settings for maximum type safety:

- `strict: true`
- `noImplicitAny: true`
- `noImplicitReturns: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

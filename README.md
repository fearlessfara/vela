# Vela

Vela is a pure Apache Velocity Template Language (VTL) engine implemented in TypeScript. It aims for 1:1 compatibility with the Java reference implementation, using Chevrotain for parsing and a clean runtime evaluator.

## Features

- Chevrotain-driven lexer and parser with Velocity-compatible grammar
- Pure VTL evaluation: directives (#set, #if, #foreach, #break, #stop), expressions, variable references
- Simple API: pass template string and context map, get rendered output
- Test harness for comparing TypeScript output with Java reference implementation

## Installation

```bash
# Clone the repository and install dependencies
npm install

# Initialize git submodule for Apache Velocity reference
git submodule update --init

# Compile the library and supporting tools
npm run build
```

## Usage

### Basic Example

```typescript
import { VelocityEngine } from '@fearlessfara/vela';

const engine = new VelocityEngine();
const output = engine.render('Hello, $name!', { name: 'World' });
console.log(output); // "Hello, World!"
```

### Advanced Example

```typescript
import { VelocityEngine } from '@fearlessfara/vela';

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

## Testing

The project includes a test harness that compares TypeScript output with the Java reference implementation:

```bash
# Run all velocity tests
npm run test:velocity

# Run a specific test case
npm run test:velocity:single <test-name>

# Run unit tests
npm run test:unit
```

### Test Structure

Test cases are located in `tests/velocity/<test-name>/`:
- `template.vtl` - Velocity template to render
- `input.json` - Context/variables as JSON object

The test harness runs both Java and TypeScript engines and compares outputs byte-for-byte.

## Apache Velocity Compatibility

This implementation targets 1:1 compatibility with the Apache Velocity Java reference implementation. The test harness uses Java as the source of truth and ensures TypeScript output matches exactly.

### Supported Features

- Text segments and interpolations (`$ref`, `$!ref`, `${expr}`)
- Directives: `#set`, `#if/#elseif/#else`, `#foreach`, `#break`, `#stop`
- Expressions: literals, member access, function calls, arrays, maps, operators
- Variable scoping and `#foreach` loop variables
- Truthiness and type coercion per Velocity semantics

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

## Contributing

1. Fork or clone the repository and create topic branches off `main`.
2. Run `npm run build` followed by `npm run test` to ensure changes pass all checks.
3. Add test cases in `tests/velocity/` for new features.
4. Submit a pull request that references any related issues.

Contributions that improve compatibility with the Java reference implementation are particularly welcome.

## License

[Add license information here]

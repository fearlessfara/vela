# Vela

Vela is a pure Apache Velocity Template Language (VTL) engine implemented in TypeScript. It provides 1:1 compatibility with the Java reference implementation, using a Chevrotain-based parser and a runtime that matches Apache Velocity behavior exactly.

## Features

- Chevrotain-driven lexer and parser with Apache Velocity-compatible precedence rules.
- Pure Velocity runtime with no API Gateway-specific code.
- Simple API: template string + context map → rendered output.
- Test harness for comparing TypeScript output with Java reference implementation.

## Installation

```bash
# Clone the repository and install dependencies
npm install

# Initialize the Apache Velocity submodule
git submodule update --init --recursive

# Compile the library and supporting tools
npm run build
```

## Usage

The library targets Node.js 22 and ships TypeScript sources. You can execute templates through the compiled runtime.

```typescript
import { VelocityEngine } from '@fearlessfara/vela';

const engine = new VelocityEngine();

// Simple template with context variables
const template = 'Hello $name! You have $count items.';
const context = {
  name: 'World',
  count: 42
};

const output = engine.render(template, context);
// Output: "Hello World! You have 42 items."
```

### Advanced Usage

For advanced usage, you can access the parser, AST converter, and evaluator directly:

```typescript
import { VtlParser, cstToAst, VtlEvaluator } from '@fearlessfara/vela';

const parser = new VtlParser();
const parseResult = parser.parse(template);
const ast = cstToAst(parseResult.cst);
const evaluator = new VtlEvaluator(context);
const output = evaluator.evaluateTemplate(ast);
```

## Testing

The project includes a test harness that compares TypeScript output with the Java Apache Velocity reference implementation.

```bash
# Run all velocity tests (compares TS vs Java)
npm run test:velocity

# Run a single test case
npm run test:velocity:single <test-name>

# Run unit tests
npm run test:unit
```

Test cases are located in `tests/velocity/`. Each test case contains:
- `template.vtl` - Velocity template to render
- `input.json` - Context/variables as JSON object

The Java output serves as the source of truth for all comparisons.

## Apache Velocity Compatibility

Vela aims for 1:1 compatibility with the Apache Velocity Java reference implementation. The test harness ensures that TypeScript output matches Java output byte-for-byte.

### Supported Features

- Text segments and interpolations
- Directives: `#set`, `#if/#elseif/#else`, `#foreach`, `#break`, `#stop`
- Expressions: literals, member access, function calls, arrays, maps, operators
- Variable references: `$var`, `$!var`, `${expr}`
- Scope management for `#set` and `#foreach`

### Test Harness

The test harness (`tools/compare-velocity/`) invokes both the Java and TypeScript engines and compares their outputs. This ensures ongoing compatibility as the codebase evolves.

## Support

- **Bug reports & feature requests:** Open an issue in the repository with reproduction steps and template samples when possible.
- **Security concerns:** Please use a private disclosure channel such as a direct maintainer email rather than filing a public issue.
- **Questions & discussions:** Start a GitHub discussion or reach out through the repository's preferred community forum.

## Contributing

1. Fork or clone the repository and create topic branches off `main`.
2. Run `npm run build` followed by `npm run test` to ensure changes pass all checks.
3. Submit a pull request that references any related issues and describes expected Apache Velocity compatibility behavior.

Contributions that expand test coverage or improve compatibility with the Java reference implementation are particularly welcome.

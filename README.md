# Velocits

A TypeScript implementation of the Apache Velocity Template Language (VTL) with 1:1 Java compatibility. Built for both Node.js and browser environments using modern TypeScript best practices.

## Features

- **Full VTL Support**: Directives (`#set`, `#if`, `#foreach`, `#break`, `#stop`), expressions, and variable references
- **File-Based Templates**: Load templates from files using resource loaders (Node.js only)
- **Java-Compatible**: 1:1 compatibility with Apache Velocity, tested against the Java reference implementation
- **Configuration System**: Full properties/options support matching Java's RuntimeConstants
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

### String Templates

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

### File-Based Templates (Node.js only)

```typescript
import { VelocityEngine, RuntimeConstants } from '@fearlessfara/velocits';

// Configure engine with file resource loader
const engine = new VelocityEngine({
  fileResourceLoaderPath: './templates',
  fileResourceLoaderCache: true
});
engine.init();

// Load and render a template file
const output = engine.mergeTemplate('welcome.vtl', {
  name: 'World',
  items: ['one', 'two', 'three']
});

// Or get the template object first
const template = engine.getTemplate('welcome.vtl');
const output2 = template.merge({ name: 'User' });
```

### Using RuntimeConstants

```typescript
import { VelocityEngine, RuntimeConstants } from '@fearlessfara/velocits';

const engine = new VelocityEngine();

// Set properties using RuntimeConstants
engine.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, './templates');
engine.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_CACHE, true);
engine.setProperty(RuntimeConstants.INPUT_ENCODING, 'UTF-8');
engine.setProperty(RuntimeConstants.SPACE_GOBBLING, 'lines');

// Or use setProperties with a Map
const props = new Map();
props.set(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, './templates');
props.set(RuntimeConstants.FILE_RESOURCE_LOADER_CACHE, true);
engine.setProperties(props);

engine.init();

// Check if a template exists
if (engine.resourceExists('template.vtl')) {
  const output = engine.mergeTemplate('template.vtl', context);
}
```

## Supported Features

### Template Language
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

### Engine Features
- **File-Based Templates** (Node.js only):
  - `getTemplate(name, encoding?)` - Load and parse template files
  - `getTemplateAsync(name, encoding?)` - Async version
  - `mergeTemplate(name, context)` - Load and render in one step
  - `resourceExists(name)` - Check if template file exists
- **Resource Loaders**:
  - `FileResourceLoader` - Load templates from the filesystem
  - `StringResourceLoader` - In-memory string templates
  - Custom resource loaders via `ResourceLoader` interface
- **Configuration**:
  - `setProperty(key, value)` - Set individual properties
  - `addProperty(key, value)` - Add to array properties
  - `getProperty(key)` - Get property value
  - `setProperties(map)` - Bulk set from Map
  - `setPropertiesFromFile(path)` - Load from .properties file
  - `init()` / `init(properties)` / `init(propertiesFile)` - Initialize engine
  - All Java RuntimeConstants supported
- **Caching**: Template caching with configurable options
- **Encoding**: Configurable character encoding (default UTF-8)

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

## API Reference

### VelocityEngine

```typescript
class VelocityEngine {
  constructor(config?: VelocityEngineConfig | string)

  // Initialization
  init(): void
  init(properties: Map<string, any>): void
  init(propertiesFile: string): void
  reset(): void

  // String template rendering
  render(template: string, context?: object): string
  evaluate(context: object, template: string, logTag?: string): string

  // File-based templates (Node.js only)
  getTemplate(name: string, encoding?: string): Template
  getTemplateAsync(name: string, encoding?: string): Promise<Template>
  mergeTemplate(name: string, context: object): string
  mergeTemplate(name: string, encoding: string | null, context: object): string
  resourceExists(name: string): boolean

  // Configuration
  setProperty(key: string, value: any): void
  getProperty(key: string): any
  addProperty(key: string, value: any): void
  clearProperty(key: string): void
  setProperties(properties: Map<string, any>): void
  setPropertiesFromFile(path: string): void

  // Application attributes
  setApplicationAttribute(key: string, value: any): void
  getApplicationAttribute(key: string): any

  // Resource loaders
  addResourceLoader(name: string, loader: ResourceLoader): void
  getResourceLoader(name: string): ResourceLoader | null
}
```

### Template

```typescript
class Template {
  constructor(name: string, encoding?: string, spaceGobbling?: SpaceGobblingMode)

  getName(): string
  getEncoding(): string
  getLastModified(): number

  process(): Promise<boolean>
  processSync(): boolean
  merge(context?: object): string
  isProcessed(): boolean

  setResourceLoader(loader: ResourceLoader): void
}
```

### RuntimeConstants

All Apache Velocity runtime constants are available:

```typescript
import { RuntimeConstants } from '@fearlessfara/velocits';

RuntimeConstants.FILE_RESOURCE_LOADER_PATH
RuntimeConstants.FILE_RESOURCE_LOADER_CACHE
RuntimeConstants.INPUT_ENCODING
RuntimeConstants.SPACE_GOBBLING
RuntimeConstants.RUNTIME_STRING_INTERNING
RuntimeConstants.MAX_NUMBER_LOOPS
// ... and many more
```

## Project Structure

```
src/
  engine.ts           - Main VelocityEngine class
  template.ts         - Template class for file-based templates
  parser/             - Chevrotain parser and AST
  runtime/            - Evaluator, scope, string builder, constants
  resource/           - Resource loaders (File, String)
  lexer/              - Token definitions
tools/
  compare-velocity/   - Test harness for Java/TS comparison
tests/
  velocity/           - Test cases (template.vtl + input.json)
  file-support/       - File loader tests
vendor/
  velocity-engine/    - Apache Velocity Java reference (git submodule)
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

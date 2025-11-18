# VelociTS

A TypeScript implementation of the Apache Velocity Template Language (VTL) with Java compatibility. Built for both Node.js and browser environments using modern TypeScript best practices.

## Features

- **Full VTL Support**: Complete Apache Velocity Template Language implementation - all directives (`#set`, `#if`, `#foreach`, `#break`, `#stop`), expressions, and variable references
- **File-Based Templates**: Load and cache templates from filesystem using resource loaders (Node.js only)
- **Java-Compatible API**: Feature parity with Apache Velocity Java engine - same methods, same behavior, tested against Java reference implementation
- **Configuration System**: Complete properties/options support with all Java RuntimeConstants
- **Stream Support**: Callback-based output (Writer equivalent) and async input (Reader equivalent)
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
  const engine = new VelociTS.VelocityEngine();
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

### Stream Support (Writer/Reader Equivalents)

```typescript
import { VelocityEngine } from '@fearlessfara/velocits';

const engine = new VelocityEngine();

// Callback-based output (Java Writer equivalent)
let output = '';
engine.evaluate(
  { name: 'World' },
  'Hello, $name!',
  'myTemplate',
  (chunk) => { output += chunk; }
);

// Async input support (Java Reader equivalent)
const result = await engine.evaluateReader(
  { message: 'Async content' },
  async () => {
    // Load template from async source
    const templateContent = await fetchTemplate();
    return templateContent;
  }
);

// Combined: async input + callback output
await engine.evaluateReader(
  context,
  async () => await loadTemplate(),
  'logTag',
  (chunk) => process.stdout.write(chunk)
);
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

### Engine Features (Java API Parity)
- **File-Based Templates** (Node.js only):
  - `getTemplate(name, encoding?)` - Load and parse template files
  - `getTemplateAsync(name, encoding?)` - Async version
  - `mergeTemplate(name, context)` - Load and render in one step
  - `resourceExists(name)` - Check if template file exists
- **Stream Support**:
  - `evaluate()` with callback - Stream output (Writer equivalent)
  - `evaluateReader()` - Async input support (Reader equivalent)
- **Resource Loaders**:
  - `FileResourceLoader` - Load templates from the filesystem
  - `StringResourceLoader` - In-memory string templates
  - `addResourceLoader()` / `getResourceLoader()` - Custom loaders
  - ResourceLoader interface for implementing custom loaders
- **Configuration** (all Java RuntimeConstants):
  - `setProperty(key, value)` - Set individual properties
  - `addProperty(key, value)` - Add to array properties
  - `getProperty(key)` / `clearProperty(key)` - Manage properties
  - `setProperties(map)` - Bulk configuration from Map
  - `setPropertiesFromFile(path)` - Load from .properties file
  - `init()` / `init(properties)` / `init(propertiesFile)` - Initialize engine
  - 60+ configuration constants matching Java implementation
- **Caching**: Template caching with configurable TTL and size limits
- **Encoding**: Configurable character encoding (default UTF-8)
- **Application Attributes**: Cross-component communication via `setApplicationAttribute()` / `getApplicationAttribute()`

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
  evaluate(context: object, template: string, logTag?: string, outputCallback?: (chunk: string) => void): string | boolean
  evaluateReader(context: object, templateContent: string | (() => Promise<string>), logTag?: string, outputCallback?: (chunk: string) => void): Promise<string | boolean>

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

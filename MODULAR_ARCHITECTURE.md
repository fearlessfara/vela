# Vela Modular Architecture

This document describes the new modular architecture that separates the core VTL engine from API Gateway-specific functionality.

## Architecture Overview

The Vela VTL engine is now split into two main components:

1. **Core VTL Engine** (`src/core/`) - Pure VTL functionality without API Gateway dependencies
2. **API Gateway Adapter** (`src/apigw/`) - API Gateway-specific functionality that wraps the core engine

## Core VTL Engine

The core engine provides the fundamental VTL parsing and evaluation capabilities without any API Gateway-specific dependencies.

### Key Features

- Pure VTL template parsing and evaluation
- Pluggable provider system for `$util`, `$input`, `$context`
- No API Gateway-specific code
- Can be used in any environment (Node.js, browser, etc.)

### Usage

```typescript
import { CoreVtlEngine, DefaultProviderRegistry, createUtilProvider } from 'vela';

// Create core engine
const engine = new CoreVtlEngine();

// Render template with basic context
const result = engine.renderTemplate({
  template: 'Hello $name!',
  context: {
    flags: { /* feature flags */ }
  }
});

// Or with custom providers
const providers = new DefaultProviderRegistry();
providers.registerProvider(createUtilProvider());

const engineWithProviders = new CoreVtlEngine(false, providers);
```

## API Gateway Adapter

The API Gateway adapter wraps the core engine and provides all the API Gateway-specific functionality.

### Key Features

- Full API Gateway VTL compatibility
- Automatic provider setup based on feature flags
- Event and context handling
- Backward compatibility with existing API

### Usage

```typescript
import { ApiGatewayVtlAdapter } from 'vela';

const adapter = new ApiGatewayVtlAdapter();

const result = adapter.renderTemplate({
  template: 'Hello $input.param("name")!',
  event: {
    httpMethod: 'GET',
    queryStringParameters: { name: 'World' }
  },
  flags: {
    APIGW_INPUT: 'ON',
    APIGW_UTILS: 'ON'
  }
});
```

## Provider System

The provider system allows you to plug in custom implementations of `$util`, `$input`, and `$context` functionality.

### Provider Interfaces

```typescript
interface UtilProvider {
  name: 'util';
  json(value: any): string;
  parseJson(jsonString: string): any;
  // ... other methods
}

interface InputProvider {
  name: 'input';
  body(): string;
  json(path?: string): any;
  // ... other methods
}

interface ContextProvider {
  name: 'context';
  requestId: string;
  httpMethod: string;
  // ... other properties
}
```

### Custom Providers

```typescript
import { ProviderRegistry, UtilProvider } from 'vela';

class CustomUtilProvider implements UtilProvider {
  name = 'util' as const;
  
  json(value: any): string {
    return JSON.stringify(value);
  }
  
  // ... implement other methods
}

const providers = new DefaultProviderRegistry();
providers.registerProvider(new CustomUtilProvider());
```

## Migration Guide

### From Monolithic to Modular

**Before:**
```typescript
import { VtlEngine } from 'vela';

const engine = new VtlEngine();
const result = engine.renderTemplate({
  template: 'Hello $input.param("name")!',
  event: apiGatewayEvent,
  context: apiGatewayContext
});
```

**After (API Gateway):**
```typescript
import { ApiGatewayVtlAdapter } from 'vela';

const adapter = new ApiGatewayVtlAdapter();
const result = adapter.renderTemplate({
  template: 'Hello $input.param("name")!',
  event: apiGatewayEvent,
  context: apiGatewayContext
});
```

**After (Core only):**
```typescript
import { CoreVtlEngine, DefaultProviderRegistry, createInputProvider } from 'vela';

const providers = new DefaultProviderRegistry();
providers.registerProvider(createInputProvider(apiGatewayEvent));

const engine = new CoreVtlEngine(false, providers);
const result = engine.renderTemplate({
  template: 'Hello $input.param("name")!',
  context: { flags: { APIGW_INPUT: 'ON' } }
});
```

## Benefits

1. **Separation of Concerns**: Core VTL logic is separate from API Gateway specifics
2. **Reusability**: Core engine can be used in non-API Gateway environments
3. **Testability**: Easier to test core functionality in isolation
4. **Flexibility**: Custom providers can be easily plugged in
5. **Maintainability**: Cleaner code organization and easier to maintain

## File Structure

```
src/
├── core/                    # Core VTL engine
│   ├── engine.ts           # Core VTL engine implementation
│   └── providers.ts        # Provider interfaces and registry
├── apigw/                  # API Gateway adapter
│   ├── adapter.ts          # API Gateway adapter
│   ├── engine.ts           # Legacy API Gateway engine (for compatibility)
│   ├── util.ts             # $util provider implementation
│   ├── input.ts            # $input provider implementation
│   └── context.ts          # $context provider implementation
├── parser/                 # VTL parser (unchanged)
├── runtime/                # VTL runtime (unchanged)
└── config/                 # Configuration (unchanged)
```

## Backward Compatibility

The existing API is still available for backward compatibility:

```typescript
// This still works
import { VtlEngine, renderTemplate } from 'vela';
```

However, it's recommended to use the new modular approach for new projects.

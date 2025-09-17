# Vela VTL Engine - Browser Usage

This document explains how to use the Vela VTL Engine in browser environments.

## Installation

```bash
npm install @fearlessfara/vela
```

## Browser Usage

### ES Modules (Recommended)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vela VTL Engine</title>
</head>
<body>
    <script type="module">
        import { renderTemplate } from '@fearlessfara/vela/browser';
        
        const template = 'Hello $context.requestId!';
        const event = {
            requestContext: { requestId: 'browser-123', stage: 'dev' }
        };
        
        const result = renderTemplate({
            template,
            event,
            flags: { APIGW_CONTEXT: 'ON' }
        });
        
        console.log(result.output); // "Hello browser-123!"
    </script>
</body>
</html>
```

### CDN Usage

```html
<script type="module">
    import { renderTemplate } from 'https://unpkg.com/@fearlessfara/vela@latest/dist-browser/browser.js';
    
    // Use the engine...
</script>
```

## Browser-Specific Features

### Polyfills Included

The browser build includes polyfills for:
- `Buffer` - Base64 encoding/decoding
- `process.env` - Environment variables (limited support)

### Browser-Compatible Utils

```javascript
import { createBrowserUtilProvider } from '@fearlessfara/vela/browser';

const util = createBrowserUtilProvider();

// Base64 encoding (browser-compatible)
const encoded = util.base64Encode('Hello World!');
const decoded = util.base64Decode(encoded);

// Time operations
const now = util.time.nowISO8601();
const epoch = util.time.epochMilli();
```

## Supported Browsers

- Chrome 80+
- Firefox 72+
- Safari 13+
- Edge 80+

## Limitations

1. **Environment Variables**: Limited support for `process.env` in browser
2. **File System**: No file system access
3. **Node.js APIs**: Only polyfilled APIs are available

## Examples

### JSON Template

```javascript
const jsonTemplate = `{
  "message": "Hello from browser!",
  "timestamp": "$util.time.nowISO8601()",
  "encoded": "$util.base64Encode('Hello World!')"
}`;

const result = renderTemplate({
    template: jsonTemplate,
    event: {},
    flags: { APIGW_UTILS: 'ON' }
});

console.log(JSON.parse(result.output));
```

### VTL Directives

```javascript
const vtlTemplate = `#set($name = "Browser User")
{
  "greeting": "Hello $name!",
  "timestamp": "$util.time.nowISO8601()"
}`;

const result = renderTemplate({
    template: vtlTemplate,
    event: {},
    flags: { APIGW_UTILS: 'ON' }
});
```

## Debug Mode

Debug mode works in browsers too:

```javascript
const result = renderTemplate({
    template: 'Hello $context.requestId!',
    event: { requestContext: { requestId: 'test' } },
    flags: { APIGW_CONTEXT: 'ON' }
}, true); // Enable debug mode

// Debug output will appear in browser console
```

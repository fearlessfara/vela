# Advanced Photos API Test

This test demonstrates comprehensive VTL template usage combining all three provider types ($context, $input, $util) based on AWS official documentation patterns.

## Test Scenario
Advanced photo API transformation that includes request metadata, photo processing, and response metadata.

## VTL Features Tested
- `$input.path('$')` - Root JSON object access
- `$input.path('$.photos.photo')` - Nested array access
- `$context.*` variables - Request context information
- `$util.time.nowISO8601()` - Timestamp generation
- `$util.escapeJavaScript()` - String escaping
- `#set()` directives - Multiple variable assignments
- `#foreach()` loops - Array iteration
- `$foreach.hasNext` - Loop control
- `#if()` conditionals - Conditional logic
- String concatenation and interpolation
- Array size access with `.size()`
- Complex JSON object construction

## Context Variables Used
- `$context.requestId` - Request identifier
- `$context.identity.userAgent` - User agent string
- `$context.identity.sourceIp` - Source IP address
- `$context.stage` - API stage
- `$context.httpMethod` - HTTP method
- `$context.stageVariables.apiVersion` - Stage variable
- `$context.requestTime` - Request timestamp

## Input Variables Used
- `$input.path('$')` - Full request body
- `$input.path('$.photos.photo')` - Photo array
- `$input.path('$.photos.page')` - Pagination data

## Util Functions Used
- `$util.time.nowISO8601()` - ISO timestamp
- `$util.escapeJavaScript()` - String escaping

## Expected Transformation
- Add comprehensive request metadata
- Transform photo data with URL generation
- Include pagination information
- Add response processing metadata
- Escape JavaScript strings for safety
- Maintain proper JSON structure

## Real-World Usage
This pattern is commonly used in production APIs for:
- Request tracing and debugging
- Data transformation and enrichment
- Security and audit logging
- API versioning and metadata

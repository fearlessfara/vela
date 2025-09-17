# Error Handling Example Test

This test demonstrates error handling and conditional logic in VTL templates based on AWS official documentation patterns.

## Test Scenario
Conditional processing with error handling for invalid or missing data.

## VTL Features Tested
- `#if()` / `#else` / `#end` - Conditional blocks
- `$input.path('$')` - Root JSON object access
- `$context.requestId` - Request context
- `$util.time.nowISO8601()` - Timestamp generation
- `$util.escapeJavaScript()` - String escaping
- `#set()` directives - Variable assignment
- `#foreach()` loops - Array iteration
- `$foreach.hasNext` - Loop control
- Boolean expressions and null checking
- Array size checking with `.size()`
- Complex conditional logic

## Conditional Logic
- Check if photos array exists and has content
- Provide success response with data if valid
- Provide error response with details if invalid
- Include request metadata in both cases

## Error Handling Features
- Graceful handling of missing data
- Structured error responses
- Request tracing with requestId
- Timestamped error responses
- Detailed error messages

## Success Path
- Process photos array normally
- Include all metadata and pagination
- Generate photo URLs
- Escape JavaScript strings

## Error Path
- Return structured error response
- Include request context for debugging
- Provide clear error messages
- Maintain consistent response format

## Real-World Usage
This pattern is essential for:
- API robustness and reliability
- Client error handling
- Debugging and monitoring
- Data validation
- Graceful degradation

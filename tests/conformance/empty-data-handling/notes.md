# Empty Data Handling Test

This test demonstrates proper handling of empty data scenarios in VTL templates.

## Test Scenario
Handle empty photos array while maintaining proper response structure.

## VTL Features Tested
- `#if()` / `#else` / `#end` - Conditional blocks
- `$input.path('$')` - Root JSON object access
- `$context.requestId` - Request context
- `$util.time.nowISO8601()` - Timestamp generation
- `#set()` directives - Variable assignment
- Array size checking with `.size()`
- Empty array handling
- Conditional response structure

## Empty Data Handling
- Check if photos array is empty (size = 0)
- Return success response with empty array
- Include pagination metadata
- Add informative message
- Maintain consistent response structure

## Response Structure
- Always include status and requestId
- Always include timestamp
- Always include pagination metadata
- Conditionally include photos array or message
- Maintain consistent JSON structure

## Real-World Usage
This pattern is essential for:
- API consistency
- Client expectation management
- Empty result handling
- Pagination with zero results
- User-friendly messaging

## Edge Cases Covered
- Empty photos array
- Zero total photos
- Zero total pages
- Valid pagination metadata
- Consistent response format

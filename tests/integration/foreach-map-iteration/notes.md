# Enhanced Iterator Types - Map Support - System Enhancement Integration Test

## Purpose
**Integration Test**: Tests system-specific enhanced iterator functionality that extends beyond Apache Velocity Engine specification compliance. This test validates system enhancement integration and cross-component iterator functionality.

This tests enhanced foreach loop support for iterating over Map-like data structures, extending beyond basic array iteration to support key-value pair collections.

## Apache Velocity Engine Compliance
- Standard Apache Velocity Engine primarily supports Collection and Array iteration
- Map iteration varies across implementations - some support direct Map iteration, others require conversion
- This enhancement ensures consistent Map iteration behavior across different environments
- Provides standard access patterns for key-value data structures

## Test Details
- **Template**: Foreach loop iterating over Map entries, accessing key and value via array indexing
- **Context**: Map represented as array of key-value pairs: `[["key1", "value1"], ["key2", "value2"]]`
- **Flags**: `VELOCITY_COUNT_SUPPORT: "ON"` - enables velocity count (though not used in this test)
- **Expected**: Each iteration provides access to both key (`$entry[0]`) and value (`$entry[1]`)

## Validation Points
1. Map entries are properly iterated in insertion order
2. Each entry is accessible as an array with key at index 0 and value at index 1
3. Standard array indexing syntax (`$entry[0]`, `$entry[1]`) works on map entries
4. Iteration count and order are predictable and consistent
5. No data loss occurs during Map iteration

## Enhanced Iterator Type Support
This test validates support for various iterator types:
- **Map Objects**: Key-value pair collections (as tested here)
- **Set Objects**: Unique value collections
- **Custom Iterables**: Objects with iteration protocols
- **Mixed Collections**: Arrays containing different data types

## Implementation Notes
- Map objects are converted to iterable entry arrays during foreach processing
- Each entry maintains its key-value relationship through array structure
- Preserves insertion order as per Map specification
- Compatible with both native JavaScript Maps and serialized Map representations

## Access Patterns
Standard patterns for accessing Map data in foreach loops:
- `$entry[0]` - Access the key
- `$entry[1]` - Access the value
- `$entry` - Access the entire entry array
- Alternative: `$entry.key` and `$entry.value` (implementation dependent)

## Backward Compatibility
- Maintains compatibility with existing array and Collection iteration
- Does not interfere with standard foreach behavior
- Provides consistent API across different data structure types
- Allows templates to work with various data sources without modification
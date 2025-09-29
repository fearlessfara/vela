# Input Params Case Test

Tests $input parameter handling with case-insensitive header lookup:
- Path parameters take precedence over query string parameters
- Query string parameters take precedence over headers
- Header lookup is case-insensitive
- $input.params() returns all parameters with proper precedence

Expected behavior: Parameters are resolved with correct precedence and case-insensitive header matching.

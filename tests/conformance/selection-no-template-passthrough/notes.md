# Selection No Template Passthrough Test

Tests selection template with passthrough behavior:
- #set directive for variable assignment
- $input.json('$') for full body parsing
- $util.toJson() for JSON serialization
- Template creates a proper API Gateway response structure

Expected behavior: Input body is parsed and passed through with proper JSON formatting.

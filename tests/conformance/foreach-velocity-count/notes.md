# Basic Foreach with $velocityCount Test

## Purpose
Tests basic `$velocityCount` support in foreach loops, validating Apache Velocity Engine compliance for the 1-based counter variable.

## Apache Velocity Engine Compliance
- `$velocityCount` is a built-in variable in Apache Velocity that provides a 1-based counter for foreach loops
- Unlike `$foreach.index` (0-based) and `$foreach.count` (1-based), `$velocityCount` is globally accessible within the loop scope
- This test ensures compatibility with standard Apache Velocity Engine behavior

## Test Details
- **Template**: Basic foreach loop accessing `$velocityCount` alongside standard foreach properties
- **Context**: Simple array of strings: `["apple", "banana", "cherry"]`
- **Flags**: `VELOCITY_COUNT_SUPPORT: "ON"` to enable the feature
- **Expected**: Each iteration shows item value, index (0-based), count (1-based), and velocityCount (1-based)

## Validation Points
1. `$velocityCount` starts at 1 for first iteration
2. `$velocityCount` increments by 1 for each iteration
3. `$velocityCount` matches `$foreach.count` values
4. Standard foreach properties (`$foreach.index`, `$foreach.count`) work alongside `$velocityCount`
# Configurable Iterator Variable Names - System Enhancement Integration Test

## Purpose
**Integration Test**: Tests system-specific enhancements for customizing iterator variable names in foreach loops. This test validates functionality that extends beyond Apache Velocity Engine specification compliance, focusing on system enhancement integration and cross-component functionality.

This tests the ability to customize iterator variable names in foreach loops, extending Apache Velocity Engine functionality with configurable naming for iterator objects and velocity count variables.

## Apache Velocity Engine Compliance
- Standard Apache Velocity Engine uses fixed names: `$foreach` and `$velocityCount`
- This enhancement allows customization of these variable names while maintaining identical functionality
- Provides compatibility with templates that may have naming conflicts or specific naming requirements
- Maintains all standard iterator properties (index, count, hasNext, etc.) under the custom name

## Test Details
- **Template**: Foreach loop using custom iterator variable names
- **Context**: Simple array: `["x", "y", "z"]`
- **Flags**: 
  - `VELOCITY_COUNT_SUPPORT: "ON"` - enables velocity count support
  - `CONFIGURABLE_ITERATOR_NAMES: "ON"` - enables custom variable names
- **Iterator Config**: 
  - `iteratorVariableName: "myIterator"` - custom name for foreach iterator object
  - `velocityCountVariableName: "myVelocityCount"` - custom name for velocity count variable
- **Expected**: Iterator properties accessible via `$myIterator.count` and velocity count via `$myVelocityCount`

## Validation Points
1. Custom iterator variable name (`$myIterator`) provides access to iterator properties
2. Custom velocity count variable name (`$myVelocityCount`) provides 1-based counter
3. Standard `$foreach` and `$velocityCount` names are not available when custom names are configured
4. All iterator functionality (count, index, hasNext, etc.) works with custom names
5. Custom names follow same scoping rules as standard names

## Enhancement Benefits
- Avoids naming conflicts in complex templates
- Allows integration with existing templates that use `$foreach` or `$velocityCount` for other purposes
- Provides consistent API while allowing customization
- Maintains backward compatibility when default names are used
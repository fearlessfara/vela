# Nested Foreach Loops with Enhanced Scope Management

## Purpose
Tests enhanced scope management for `$velocityCount` in nested foreach loops, validating proper variable scoping behavior that matches Apache Velocity Engine standards.

## Apache Velocity Engine Compliance
- In Apache Velocity Engine, nested foreach loops create separate variable scopes
- Each foreach loop maintains its own `$velocityCount` counter starting from 1
- Inner loop `$velocityCount` variables shadow outer loop variables within their scope
- When the inner loop completes, the outer loop's `$velocityCount` context is restored

## Test Details
- **Template**: Nested foreach loops where both reference `$velocityCount`
- **Context**: Array of groups, each containing an array of items
- **Flags**: 
  - `VELOCITY_COUNT_SUPPORT: "ON"` - enables $velocityCount support
  - `ENHANCED_FOREACH_SCOPE: "ON"` - enables proper nested scope management
- **Expected**: Each inner foreach loop resets `$velocityCount` to 1 and increments independently

## Validation Points
1. Outer loop `$velocityCount` is available in outer scope
2. Inner loop creates new `$velocityCount` scope starting at 1
3. Inner loop `$velocityCount` shadows outer loop within inner scope
4. Each inner loop iteration resets `$velocityCount` when loop restarts
5. Both "Outer" and "Inner" references show inner loop counter (due to scoping)

## Enhanced Scope Behavior
With `ENHANCED_FOREACH_SCOPE` enabled:
- Each foreach creates an isolated variable scope
- Inner loops properly shadow outer loop variables
- Variable restoration occurs when inner loops complete
- This matches standard Apache Velocity Engine nested loop behavior
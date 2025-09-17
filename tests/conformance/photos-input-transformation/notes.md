# Photos Input Transformation Test

This test demonstrates a real-world VTL template transformation based on AWS official documentation examples.

## Test Scenario
Transforms a complex photo data structure from input format to integration endpoint format.

## VTL Features Tested
- `$input.path('$')` - Accessing root JSON object
- `#set()` directive - Variable assignment
- `#foreach()` loop - Iterating over arrays
- `$foreach.hasNext` - Loop control variable
- `#if()` conditional - Conditional comma placement
- JSON object construction with nested properties
- String concatenation in VTL expressions
- Boolean value handling

## Input Data Structure
- Nested object with photos array
- Each photo has multiple properties including photographer names
- Mixed data types: strings, integers, booleans

## Expected Transformation
- Flatten photo array structure
- Combine photographer first and last names
- Filter and rename properties
- Maintain boolean values as-is
- Add conditional commas between array elements

## AWS Documentation Reference
This test is based on the AWS API Gateway documentation example for method request body transformation.

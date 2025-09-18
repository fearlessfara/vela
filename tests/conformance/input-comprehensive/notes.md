# Input Comprehensive Test

This test verifies that all $input variables and functions are properly accessible in VTL templates, including:

## Body Operations
- $input.body - Returns the raw request payload as a string
- $input.bodyBytes - Returns the request payload as bytes (base64 encoded for testing)

## JSON Operations
- $input.json() - Returns the parsed JSON body
- $input.json('$') - Returns the root JSON object
- $input.json('$.property') - Returns specific JSON properties
- $input.json('$.array[0]') - Returns array elements by index
- $input.json('$.nested.property') - Returns nested properties

## Parameter Operations
- $input.params() - Returns all parameters (path > querystring > header precedence)
- $input.params('name') - Returns specific parameter by name
- Case-insensitive header lookup
- Parameter precedence: path parameters override query string parameters, which override headers

## Header Operations
- $input.headers() - Returns all headers
- $input.header('name') - Returns specific header by name (case-insensitive)

## Path Operations
- $input.paths() - Returns all path parameters
- $input.path('name') - Returns specific path parameter by name

## Query String Operations
- $input.querystrings() - Returns all query string parameters
- $input.querystring('name') - Returns specific query string parameter by name

## JSONPath Subset
- Root path: $ or $.property
- Dot notation: $.user.profile.name
- Array access: $.items[0].id
- Nested array access: $.data.users[0].name

This test ensures that all AWS API Gateway VTL specification input variables and functions are properly implemented and accessible.

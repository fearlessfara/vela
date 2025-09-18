# Util Comprehensive Test

This test verifies that all $util functions are properly accessible in VTL templates, including:

## JSON Operations
- $util.json(value) - Converts value to JSON string
- $util.parseJson(jsonString) - Parses JSON string to object
- $util.toJson(value) - Alias for $util.json(value)

## Encoding Operations
- $util.base64Encode(value) - Encodes string to base64
- $util.base64Decode(value) - Decodes base64 string
- $util.urlEncode(value) - URL encodes string
- $util.urlDecode(value) - URL decodes string
- $util.escapeJavaScript(value) - Escapes JavaScript special characters

## Time Operations
- $util.time.nowISO8601() - Returns current time in ISO8601 format
- $util.time.epochMilli() - Returns current time in milliseconds since epoch
- $util.time.epochSecond() - Returns current time in seconds since epoch
- $util.time.format(template, time) - Formats time using template

## Utility Functions
- $util.qr(value) - Generates QR code representation
- $util.error(message, statusCode) - Throws error with message and status code
- $util.appendError(message, statusCode) - Appends error message
- $util.abort(message, statusCode) - Aborts execution with message and status code

## JavaScript Escaping
- Escapes backslashes: \ -> \\
- Escapes double quotes: " -> \"
- Escapes single quotes: ' -> \'
- Escapes newlines: \n -> \\n
- Escapes carriage returns: \r -> \\r
- Escapes tabs: \t -> \\t
- Escapes form feeds: \f -> \\f
- Escapes backspaces: \b -> \\b
- Escapes vertical tabs: \v -> \\v
- Escapes null characters: \0 -> \\0

## Time Formatting
- yyyy - 4-digit year
- MM - 2-digit month
- dd - 2-digit day
- HH - 2-digit hour (24-hour format)
- mm - 2-digit minute
- ss - 2-digit second
- SSS - 3-digit millisecond

This test ensures that all AWS API Gateway VTL specification utility functions are properly implemented and accessible.

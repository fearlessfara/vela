# Context Identity Min Test

Tests minimal $context functionality:
- $context.requestId for request identification
- $context.httpMethod for HTTP method
- $context.path for request path
- $context.stage for deployment stage
- $context.identity.sourceIp for client IP
- $context.identity.userAgent for user agent

Expected behavior: All context properties are accessible and return correct values.

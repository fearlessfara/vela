# Context Identity Comprehensive Test

This test verifies that all $context variables are properly accessible in VTL templates, including:

## Basic Context Variables
- $context.requestId
- $context.extendedRequestId
- $context.awsEndpointRequestId
- $context.accountId
- $context.apiId
- $context.httpMethod
- $context.path
- $context.protocol
- $context.stage
- $context.domainName
- $context.domainPrefix
- $context.deploymentId
- $context.resourceId
- $context.resourcePath
- $context.requestTime
- $context.requestTimeEpoch
- $context.wafResponseCode
- $context.webaclArn

## Stage Variables
- $context.stageVariables.* (nested object access)

## Identity Variables
- $context.identity.sourceIp
- $context.identity.userAgent
- $context.identity.user
- $context.identity.userArn
- $context.identity.cognitoIdentityId
- $context.identity.cognitoIdentityPoolId
- $context.identity.accountId
- $context.identity.apiKey
- $context.identity.apiKeyId
- $context.identity.caller
- $context.identity.accessKey
- $context.identity.cognitoAuthenticationType
- $context.identity.cognitoAuthenticationProvider
- $context.identity.userAgentV2
- $context.identity.clientCert.* (nested object access)
- $context.identity.principalOrgId
- $context.identity.vpcId
- $context.identity.vpceId

## Authorizer Variables
- $context.authorizer.claims.* (nested object access with special characters)
- $context.authorizer.scopes
- $context.authorizer.principalId
- $context.authorizer.integrationLatency

## Error Variables
- $context.error.message
- $context.error.messageString
- $context.error.statusCode

## Request Override Variables
- $context.requestOverride.header.*
- $context.requestOverride.querystring.*
- $context.requestOverride.path.*

## Response Override Variables
- $context.responseOverride.statusCode
- $context.responseOverride.header.*

This test ensures that all AWS API Gateway VTL specification context variables are properly implemented and accessible.

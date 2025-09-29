/** AWS-SPEC: Core Provider Interfaces | OWNER: vela | STATUS: READY */

// APIGW:Core Provider Interfaces

export interface CoreProvider {
  readonly name: string;
}

export interface UtilProvider extends CoreProvider {
  name: 'util';
  // JSON operations
  json(value: any): string;
  parseJson(jsonString: string): any;
  toJson(value: any): string;
  
  // Encoding operations
  base64Encode(value: string): string;
  base64Decode(value: string): string;
  urlEncode(value: string): string;
  urlDecode(value: string): string;
  escapeJavaScript(value: string): string;
  
  // Time operations
  time: {
    nowISO8601(): string;
    epochMilli(): number;
    epochSecond(): number;
    format(template: string, time?: Date): string;
  };
  
  // Utility functions
  error(message: string, statusCode?: number): never;
  appendError(message: string, statusCode?: number): void;
  abort(message: string, statusCode?: number): never;
}

export interface InputProvider extends CoreProvider {
  name: 'input';
  // Body operations
  body(): string;
  bodyBytes(): Uint8Array;
  json(path?: string): any;
  
  // Parameter operations
  params(): Record<string, string>;
  param(name: string): string;
  
  // Header operations
  header(name: string): string;
  headers(): Record<string, string>;
  
  // Path operations
  path(name: string): string;
  paths(): Record<string, string>;
  
  // Query string operations
  querystring(name: string): string;
  querystrings(): Record<string, string>;
}

export interface ContextProvider extends CoreProvider {
  name: 'context';
  // Request information
  requestId: string;
  extendedRequestId: string;
  awsEndpointRequestId: string;
  accountId: string;
  apiId: string;
  httpMethod: string;
  path: string;
  protocol: string;
  stage: string;
  stageVariables: Record<string, string>;
  domainName: string;
  domainPrefix: string;
  deploymentId: string;
  resourceId: string;
  resourcePath: string;
  requestTime: string;
  requestTimeEpoch: number;
  wafResponseCode: number;
  webaclArn: string;

  // Identity information
  identity: {
    sourceIp: string;
    userAgent: string;
    user: string;
    userArn: string;
    cognitoIdentityId: string;
    cognitoIdentityPoolId: string;
    accountId: string;
    apiKey: string;
    apiKeyId: string;
    caller: string;
    accessKey: string;
    cognitoAuthenticationType: string;
    cognitoAuthenticationProvider: string;
    userAgentV2: string;
    clientCert: any;
    principalOrgId: string;
    vpcId: string;
    vpceId: string;
  };

  // Authorizer information
  authorizer: {
    claims: Record<string, any>;
    scopes: string[];
    principalId: string;
    integrationLatency: number;
  };

  // Error information
  error: {
    message: string;
    messageString: string;
    statusCode: number;
  };

  // Request override
  requestOverride: {
    header: Record<string, string>;
    querystring: Record<string, string>;
    path: Record<string, string>;
  };

  // Response override
  responseOverride: {
    statusCode: number;
    header: Record<string, string>;
  };
}

export type Provider = UtilProvider | InputProvider | ContextProvider;

export interface ProviderRegistry {
  getProvider<T extends Provider>(name: T['name']): T | undefined;
  registerProvider(provider: Provider): void;
  unregisterProvider(name: string): void;
  hasProvider(name: string): boolean;
}

export class DefaultProviderRegistry implements ProviderRegistry {
  private providers = new Map<string, Provider>();

  getProvider<T extends Provider>(name: T['name']): T | undefined {
    return this.providers.get(name) as T | undefined;
  }

  registerProvider(provider: Provider): void {
    this.providers.set(provider.name, provider);
  }

  unregisterProvider(name: string): void {
    this.providers.delete(name);
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
}

/* Deviation Report: None - Core provider interfaces provide clean abstraction for VTL providers */

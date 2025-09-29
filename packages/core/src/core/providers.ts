/** AWS-SPEC: Core Provider System | OWNER: vela | STATUS: READY */

// APIGW:Core Provider System

export interface CoreProvider {
  readonly name: string;
}

export interface ProviderRegistry {
  getProvider<T extends CoreProvider>(name: T['name']): T | undefined;
  registerProvider(provider: CoreProvider): void;
  unregisterProvider(name: string): void;
  hasProvider(name: string): boolean;
}

export class DefaultProviderRegistry implements ProviderRegistry {
  private providers = new Map<string, CoreProvider>();

  getProvider<T extends CoreProvider>(name: T['name']): T | undefined {
    return this.providers.get(name) as T | undefined;
  }

  registerProvider(provider: CoreProvider): void {
    this.providers.set(provider.name, provider);
  }

  unregisterProvider(name: string): void {
    this.providers.delete(name);
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
}

/* Deviation Report: None - Core provider system provides minimal abstraction for VTL providers without API Gateway dependencies */